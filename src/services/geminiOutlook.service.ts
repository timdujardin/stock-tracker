import {
  HTTP_RATE_LIMIT,
  MAX_DAILY_REQUESTS,
  MAX_OUTLOOK_HEADLINES,
  MS_PER_DAY,
  OUTLOOK_CACHE_TTL_DAYS,
} from '@/config/app.config';
import type { CategoryOutlook, NewsArticle } from '@/types';
import {
  createApiError,
  createEmptyResponseError,
  createNotFoundError,
  createRateLimitError,
  type AppError,
} from '@/types/errors';

import { fetchWithRetry } from '@/utils/retry.util';

import { hasReachedDailyLimit, incrementDailyUsage } from './geminiSummary.service';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const OUTLOOK_CACHE_PREFIX = 'gemini_outlook_';

const buildOutlookCacheKey = (categoryId: string): string => {
  return `${OUTLOOK_CACHE_PREFIX}${categoryId}`;
};

const MAX_CACHE_AGE_MS = OUTLOOK_CACHE_TTL_DAYS * MS_PER_DAY;

export const getCachedOutlook = (categoryId: string): CategoryOutlook | null => {
  try {
    const stored = localStorage.getItem(buildOutlookCacheKey(categoryId));
    if (!stored) return null;

    const parsed = JSON.parse(stored) as CategoryOutlook;
    if (Date.now() - parsed.generatedAt > MAX_CACHE_AGE_MS) {
      localStorage.removeItem(buildOutlookCacheKey(categoryId));
      return null;
    }
    return parsed;
  } catch {
    // localStorage may be unavailable
  }
  return null;
};

const saveOutlookToCache = (categoryId: string, outlook: CategoryOutlook): void => {
  try {
    localStorage.setItem(buildOutlookCacheKey(categoryId), JSON.stringify(outlook));
  } catch {
    // localStorage may be unavailable
  }
};

/** Removes outlook cache entries older than the configured TTL (including legacy date-suffixed keys). */
export const removeExpiredOutlookCache = (): void => {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key?.startsWith(OUTLOOK_CACHE_PREFIX)) continue;

      try {
        const stored = localStorage.getItem(key);
        if (!stored) continue;
        const parsed = JSON.parse(stored) as CategoryOutlook;
        if (!parsed.generatedAt || Date.now() - parsed.generatedAt > MAX_CACHE_AGE_MS) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // localStorage may be unavailable
  }
};

interface SentimentCounts {
  positive: number;
  negative: number;
  neutral: number;
}

const countSentiments = (articles: NewsArticle[]): SentimentCounts => {
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  for (const a of articles) {
    if (a.sentiment === 'positive') positive++;
    else if (a.sentiment === 'negative') negative++;
    else neutral++;
  }
  return { positive, negative, neutral };
};

const buildOutlookPrompt = (categoryName: string, articles: NewsArticle[]): string => {
  const sentimentArrows: Record<string, string> = { positive: '↑', negative: '↓', neutral: '→' };
  const headlines = articles
    .slice(0, MAX_OUTLOOK_HEADLINES)
    .map((article) => `${sentimentArrows[article.sentiment] ?? '→'} ${article.title}`)
    .join('\n');

  const counts = countSentiments(articles);

  return `Je bent een financieel analist. Analyseer onderstaande nieuwskoppen voor "${categoryName}" en geef een langetermijnvooruitzicht (10 jaar).

Sentimentverdeling: ${counts.positive} positief, ${counts.negative} negatief, ${counts.neutral} neutraal.

Koppen:
${headlines}

Geef je antwoord als ENKEL een JSON-object (geen markdown, geen uitleg eromheen) met exact dit formaat:
{
  "dataPoints": [
    { "year": 0, "score": <huidig sentiment -10 tot 10> },
    { "year": 1, "score": <vooruitzicht 1 jaar> },
    { "year": 2, "score": <vooruitzicht 2 jaar> },
    { "year": 5, "score": <vooruitzicht 5 jaar> },
    { "year": 8, "score": <vooruitzicht 8 jaar> },
    { "year": 10, "score": <vooruitzicht 10 jaar> }
  ],
  "bullish": ["factor 1", "factor 2", "factor 3"],
  "bearish": ["factor 1", "factor 2", "factor 3"],
  "summary": "1-2 zinnen samenvatting van de outlook in het Nederlands"
}

Score-schaal: -10 = extreem negatief, 0 = neutraal, +10 = extreem positief.
Baseer je op: nieuwssentiment, analistenconsensus, sector-/markttrends, winstmarges en groeiprognoses.
Geef maximaal 3 bullish en 3 bearish factoren, in het Nederlands.`;
};

const parseOutlookResponse = (raw: string): CategoryOutlook | null => {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as CategoryOutlook;

    if (!Array.isArray(parsed.dataPoints) || parsed.dataPoints.length === 0) return null;
    if (!Array.isArray(parsed.bullish)) parsed.bullish = [];
    if (!Array.isArray(parsed.bearish)) parsed.bearish = [];
    if (typeof parsed.summary !== 'string') parsed.summary = '';

    for (const point of parsed.dataPoints) {
      point.score = Math.max(-10, Math.min(10, Number(point.score) || 0));
      point.year = Number(point.year) || 0;
    }

    return { ...parsed, generatedAt: Date.now() };
  } catch {
    return null;
  }
};

/** Successful outlook generation result. */
interface OutlookResult {
  outlook: CategoryOutlook;
  error: null;
}

/** Failed outlook generation result. */
interface OutlookFailure {
  outlook: null;
  error: AppError;
}

/**
 * Generates an AI-powered long-term outlook for a single category via the Gemini API.
 * Used by the per-category "Vernieuwen" button.
 */
export const generateCategoryOutlook = async (
  apiKey: string,
  categoryId: string,
  categoryName: string,
  articles: NewsArticle[],
): Promise<OutlookResult | OutlookFailure> => {
  if (!articles.length) {
    return { outlook: null, error: createNotFoundError('Geen artikelen beschikbaar voor outlook.') };
  }

  if (hasReachedDailyLimit()) {
    return { outlook: null, error: createRateLimitError(MAX_DAILY_REQUESTS) };
  }

  let response: Response;
  try {
    response = await fetchWithRetry(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildOutlookPrompt(categoryName, articles) }] }],
      }),
    });
  } catch {
    return { outlook: null, error: createApiError('Kan geen verbinding maken met de Gemini API.') };
  }

  if (!response.ok) {
    const statusCode = response.status;
    if (statusCode === HTTP_RATE_LIMIT) {
      return { outlook: null, error: createRateLimitError(MAX_DAILY_REQUESTS) };
    }
    return { outlook: null, error: createApiError(`Gemini API gaf status ${statusCode} terug.`, statusCode) };
  }

  const data = await response.json();
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const outlook = parseOutlookResponse(rawText);
  if (!outlook) {
    return { outlook: null, error: createEmptyResponseError('De AI gaf geen bruikbare outlook terug.') };
  }

  saveOutlookToCache(categoryId, outlook);
  incrementDailyUsage();

  return { outlook, error: null };
};

export interface CategoryInput {
  name: string;
  articles: NewsArticle[];
}

export interface BatchOutlookResult {
  outlooks: Record<string, CategoryOutlook>;
  errors: Record<string, AppError>;
}

const buildBatchOutlookPrompt = (categories: Record<string, CategoryInput>): string => {
  const sentimentArrows: Record<string, string> = { positive: '↑', negative: '↓', neutral: '→' };

  const sections = Object.entries(categories)
    .map(([id, { name, articles }]) => {
      const headlines = articles
        .slice(0, MAX_OUTLOOK_HEADLINES)
        .map((a) => `${sentimentArrows[a.sentiment] ?? '→'} ${a.title}`)
        .join('\n');
      const counts = countSentiments(articles);
      return `## ${name} (id: "${id}")
Sentiment: ${counts.positive} positief, ${counts.negative} negatief, ${counts.neutral} neutraal.
${headlines}`;
    })
    .join('\n\n');

  const ids = Object.keys(categories)
    .map((id) => `"${id}"`)
    .join(', ');

  return `Je bent een financieel analist. Analyseer onderstaande nieuwskoppen per categorie en geef voor ELKE categorie een langetermijnvooruitzicht (10 jaar).

${sections}

Geef je antwoord als ENKEL een JSON-object (geen markdown, geen uitleg eromheen) met exact dit formaat, met een sleutel per categorie-id (${ids}):
{
  "<category_id>": {
    "dataPoints": [
      { "year": 0, "score": <huidig sentiment -10 tot 10> },
      { "year": 1, "score": <vooruitzicht 1 jaar> },
      { "year": 2, "score": <vooruitzicht 2 jaar> },
      { "year": 5, "score": <vooruitzicht 5 jaar> },
      { "year": 8, "score": <vooruitzicht 8 jaar> },
      { "year": 10, "score": <vooruitzicht 10 jaar> }
    ],
    "bullish": ["factor 1", "factor 2", "factor 3"],
    "bearish": ["factor 1", "factor 2", "factor 3"],
    "summary": "1-2 zinnen samenvatting van de outlook in het Nederlands"
  }
}

Score-schaal: -10 = extreem negatief, 0 = neutraal, +10 = extreem positief.
Baseer je op: nieuwssentiment, analistenconsensus, sector-/markttrends, winstmarges en groeiprognoses.
Geef maximaal 3 bullish en 3 bearish factoren per categorie, in het Nederlands.`;
};

const validateOutlookEntry = (raw: unknown): CategoryOutlook | null => {
  try {
    const entry = raw as CategoryOutlook;
    if (!Array.isArray(entry.dataPoints) || entry.dataPoints.length === 0) return null;
    if (!Array.isArray(entry.bullish)) entry.bullish = [];
    if (!Array.isArray(entry.bearish)) entry.bearish = [];
    if (typeof entry.summary !== 'string') entry.summary = '';

    for (const point of entry.dataPoints) {
      point.score = Math.max(-10, Math.min(10, Number(point.score) || 0));
      point.year = Number(point.year) || 0;
    }

    return { ...entry, generatedAt: Date.now() };
  } catch {
    return null;
  }
};

/**
 * Generates outlooks for multiple categories in a single Gemini API call.
 * Each valid result is cached individually.
 */
export const generateBatchOutlooks = async (
  apiKey: string,
  categories: Record<string, CategoryInput>,
): Promise<BatchOutlookResult> => {
  const categoryIds = Object.keys(categories);
  if (categoryIds.length === 0) {
    return { outlooks: {}, errors: {} };
  }

  if (hasReachedDailyLimit()) {
    const error = createRateLimitError(MAX_DAILY_REQUESTS);
    const errors: Record<string, AppError> = {};
    for (const id of categoryIds) errors[id] = error;
    return { outlooks: {}, errors };
  }

  let response: Response;
  try {
    response = await fetchWithRetry(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildBatchOutlookPrompt(categories) }] }],
      }),
    });
  } catch {
    const error = createApiError('Kan geen verbinding maken met de Gemini API.');
    const errors: Record<string, AppError> = {};
    for (const id of categoryIds) errors[id] = error;
    return { outlooks: {}, errors };
  }

  if (!response.ok) {
    const statusCode = response.status;
    const error =
      statusCode === HTTP_RATE_LIMIT
        ? createRateLimitError(MAX_DAILY_REQUESTS)
        : createApiError(`Gemini API gaf status ${statusCode} terug.`, statusCode);
    const errors: Record<string, AppError> = {};
    for (const id of categoryIds) errors[id] = error;
    return { outlooks: {}, errors };
  }

  const data = await response.json();
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  let parsed: Record<string, unknown>;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error();
    parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch {
    const error = createEmptyResponseError('De AI gaf geen bruikbaar batch-antwoord terug.');
    const errors: Record<string, AppError> = {};
    for (const id of categoryIds) errors[id] = error;
    return { outlooks: {}, errors };
  }

  const outlooks: Record<string, CategoryOutlook> = {};
  const errors: Record<string, AppError> = {};

  for (const id of categoryIds) {
    const entry = validateOutlookEntry(parsed[id]);
    if (entry) {
      saveOutlookToCache(id, entry);
      outlooks[id] = entry;
    } else {
      errors[id] = createEmptyResponseError('De AI gaf geen bruikbare outlook terug voor deze categorie.');
    }
  }

  incrementDailyUsage();

  return { outlooks, errors };
};

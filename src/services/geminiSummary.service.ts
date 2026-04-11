import {
  HTTP_RATE_LIMIT,
  MAX_DAILY_REQUESTS,
  MAX_SUMMARY_HEADLINES,
  SUMMARY_CACHE_TTL_DAYS,
} from '@/config/app.config';
import type { CategorySummary, NewsArticle } from '@/types';
import {
  createApiError,
  createEmptyResponseError,
  createNotFoundError,
  createRateLimitError,
  type AppError,
} from '@/types/errors';
import { getTodayDateKey } from '@/utils/timeFormatting.util';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const USAGE_STORAGE_KEY = 'gemini_usage';

interface DailyUsage {
  date: string;
  count: number;
}

/** Retrieves today's Gemini API usage count from localStorage */
export const getDailyUsageCount = (): DailyUsage => {
  try {
    const stored = localStorage.getItem(USAGE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as DailyUsage;
      if (parsed.date === getTodayDateKey()) {
        return parsed;
      }
    }
  } catch {
    // localStorage may be unavailable
  }
  return { date: getTodayDateKey(), count: 0 };
};

/**
 * Increments today's Gemini API usage counter in localStorage.
 * @returns The updated usage count after incrementing.
 */
export const incrementDailyUsage = (): number => {
  const usage = getDailyUsageCount();
  usage.count++;
  localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
  return usage.count;
};

/** Checks whether the daily Gemini API request limit has been reached. */
export const hasReachedDailyLimit = (): boolean => {
  return getDailyUsageCount().count >= MAX_DAILY_REQUESTS;
};

/**
 * Calculates how many Gemini API calls remain for today.
 * @returns The number of remaining allowed calls.
 */
export const getRemainingDailyCalls = (): number => {
  return MAX_DAILY_REQUESTS - getDailyUsageCount().count;
};

const buildCacheKey = (categoryId: string): string => {
  return `gemini_sum_${categoryId}_${getTodayDateKey()}`;
};

/**
 * Retrieves a cached summary for the given category from localStorage.
 * Returns null if not found or if the cached value is an old plain-text format.
 */
export const getCachedSummary = (categoryId: string): CategorySummary | null => {
  try {
    const stored = localStorage.getItem(buildCacheKey(categoryId));
    if (!stored) return null;

    const parsed = JSON.parse(stored) as CategorySummary;
    if (parsed.text && parsed.recommendation) return parsed;

    return null;
  } catch {
    return null;
  }
};

/** Persists a generated summary to localStorage for the given category. */
export const saveSummaryToCache = (categoryId: string, summary: CategorySummary): void => {
  try {
    localStorage.setItem(buildCacheKey(categoryId), JSON.stringify(summary));
  } catch {
    // localStorage may be unavailable
  }
};

/** Removes summary cache entries from localStorage that exceed the configured TTL. */
export const removeExpiredCache = (): void => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - SUMMARY_CACHE_TTL_DAYS);
    const cutoffKey = cutoffDate.toISOString().slice(0, 10);

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('gemini_sum_')) {
        const dateInKey = key.split('_').pop() || '';
        if (dateInKey < cutoffKey) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch {
    // localStorage may be unavailable
  }
};

const VALID_RECOMMENDATIONS = new Set(['STRONG_SELL', 'SELL', 'HOLD', 'BUY', 'STRONG_BUY']);

const buildSummaryPrompt = (categoryName: string, articles: NewsArticle[]): string => {
  const sentimentArrows: Record<string, string> = { positive: '↑', negative: '↓', neutral: '→' };
  const headlines = articles
    .slice(0, MAX_SUMMARY_HEADLINES)
    .map((article) => `${sentimentArrows[article.sentiment] ?? '→'} ${article.title}`)
    .join('\n');

  return `Je bent een financieel nieuwsanalist. Analyseer onderstaande nieuwskoppen van vandaag voor de categorie "${categoryName}".

Koppen:
${headlines}

Geef je antwoord als ENKEL een JSON-object (geen markdown, geen uitleg eromheen) met exact dit formaat:
{
  "text": "3-4 beknopte zinnen samenvatting in het Nederlands. Focus op prijsbewegingen, risicosignalen en kansen voor beleggers. Wees concreet en vermijd algemeenheden.",
  "recommendation": "STRONG_SELL | SELL | HOLD | BUY | STRONG_BUY",
  "reasoning": "1 korte zin in het Nederlands die je beleggingsindicatie onderbouwt op basis van het nieuws."
}

Kies EXACT één van: STRONG_SELL, SELL, HOLD, BUY, STRONG_BUY.
Baseer je indicatie op: nieuwssentiment, analistenconsensus, prijsbewegingen en risicosignalen uit de koppen.`;
};

const parseSummaryResponse = (raw: string): CategorySummary | null => {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as CategorySummary;

    if (typeof parsed.text !== 'string' || !parsed.text) return null;
    if (!VALID_RECOMMENDATIONS.has(parsed.recommendation)) return null;
    if (typeof parsed.reasoning !== 'string') parsed.reasoning = '';

    return parsed;
  } catch {
    return null;
  }
};

/** Successful summary generation result. */
export interface SummarySuccess {
  summary: CategorySummary;
  error: null;
}

/** Failed summary generation result. */
export interface SummaryFailure {
  summary: null;
  error: AppError;
}

/**
 * Generates an AI summary with investment recommendation via the Gemini API.
 * @returns A result with the structured summary, or a failure with error details.
 */
export const generateCategorySummary = async (
  apiKey: string,
  categoryId: string,
  categoryName: string,
  articles: NewsArticle[],
): Promise<SummarySuccess | SummaryFailure> => {
  if (!articles.length) {
    return { summary: null, error: createNotFoundError('Geen artikelen beschikbaar om samen te vatten.') };
  }

  if (hasReachedDailyLimit()) {
    return { summary: null, error: createRateLimitError(MAX_DAILY_REQUESTS) };
  }

  let response: Response;
  try {
    response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildSummaryPrompt(categoryName, articles) }] }],
      }),
    });
  } catch {
    return { summary: null, error: createApiError('Kan geen verbinding maken met de Gemini API.') };
  }

  if (!response.ok) {
    const statusCode = response.status;
    if (statusCode === HTTP_RATE_LIMIT) {
      return { summary: null, error: createRateLimitError(MAX_DAILY_REQUESTS) };
    }

    return { summary: null, error: createApiError(`Gemini API gaf status ${statusCode} terug.`, statusCode) };
  }

  const data = await response.json();
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const summary = parseSummaryResponse(rawText);
  if (!summary) {
    return { summary: null, error: createEmptyResponseError('De AI gaf geen bruikbare samenvatting terug.') };
  }

  saveSummaryToCache(categoryId, summary);
  incrementDailyUsage();

  return { summary, error: null };
};

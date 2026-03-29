import {
  HTTP_RATE_LIMIT,
  MAX_DAILY_REQUESTS,
  MAX_SUMMARY_HEADLINES,
  SUMMARY_CACHE_TTL_DAYS,
} from '@/config/app.config';
import type { NewsArticle } from '@/types';
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
 * @param categoryId - The category to look up.
 * @returns The cached summary text, or null if not found.
 */
export const getCachedSummary = (categoryId: string): string | null => {
  try {
    return localStorage.getItem(buildCacheKey(categoryId));
  } catch {
    return null;
  }
};

/**
 * Persists a generated summary to localStorage for the given category.
 * @param categoryId - The category to cache the summary for.
 * @param summaryText - The AI-generated summary text.
 */
export const saveSummaryToCache = (categoryId: string, summaryText: string): void => {
  try {
    localStorage.setItem(buildCacheKey(categoryId), summaryText);
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

const buildSummaryPrompt = (categoryName: string, articles: NewsArticle[]): string => {
  const sentimentArrows: Record<string, string> = { positive: '↑', negative: '↓', neutral: '→' };
  const headlines = articles
    .slice(0, MAX_SUMMARY_HEADLINES)
    .map((article) => `${sentimentArrows[article.sentiment] ?? '→'} ${article.title}`)
    .join('\n');

  return `Je bent een financieel nieuwsanalist. Vat onderstaande nieuwskoppen van vandaag samen voor de categorie "${categoryName}" in 3-4 beknopte zinnen in het Nederlands. Focus op prijsbewegingen, risicosignalen en kansen voor beleggers. Wees concreet en vermijd algemeenheden.

Koppen:
${headlines}`;
};

/** Successful summary generation result containing the AI-generated text. */
export interface SummaryResult {
  text: string;
  error: null;
}

/** Failed summary generation result containing the error details. */
export interface SummaryFailure {
  text: null;
  error: AppError;
}

/**
 * Generates an AI summary for a category's articles via the Gemini API.
 * @param apiKey - The Gemini API key.
 * @param categoryId - The category to summarize.
 * @param categoryName - The display name of the category.
 * @param articles - The news articles to summarize.
 * @returns A result with the summary text, or a failure with error details.
 */
export const generateCategorySummary = async (
  apiKey: string,
  categoryId: string,
  categoryName: string,
  articles: NewsArticle[],
): Promise<SummaryResult | SummaryFailure> => {
  if (!articles.length) {
    return { text: null, error: createNotFoundError('Geen artikelen beschikbaar om samen te vatten.') };
  }

  if (hasReachedDailyLimit()) {
    return { text: null, error: createRateLimitError(MAX_DAILY_REQUESTS) };
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
    return { text: null, error: createApiError('Kan geen verbinding maken met de Gemini API.') };
  }

  if (!response.ok) {
    const statusCode = response.status;
    if (statusCode === HTTP_RATE_LIMIT) {
      return { text: null, error: createRateLimitError(MAX_DAILY_REQUESTS) };
    }

    return { text: null, error: createApiError(`Gemini API gaf status ${statusCode} terug.`, statusCode) };
  }

  const data = await response.json();
  const summaryText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!summaryText) {
    return { text: null, error: createEmptyResponseError('De AI gaf geen bruikbare samenvatting terug.') };
  }

  saveSummaryToCache(categoryId, summaryText);
  incrementDailyUsage();

  return { text: summaryText, error: null };
};

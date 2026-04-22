import { createContext, useCallback, useContext, useEffect, useMemo, useState, type FC, type ReactNode } from 'react';

import { MAX_DAILY_REQUESTS } from '@/config/app.config';
import { CATEGORY_IDS } from '@/config/feedSources.config';
import {
  generateCategorySummary,
  getCachedSummary,
  removeExpiredCache,
  saveSummaryToCache,
} from '@/services/geminiSummary.service';
import type { CategorySummary, NewsArticle } from '@/types';
import { createApiError, createRateLimitError, type AppError } from '@/types/errors';

import { useGeminiUsage } from './GeminiUsageContext';

interface GeminiSummaryContextValue {
  summaries: Record<string, CategorySummary>;
  summaryErrors: Record<string, AppError>;
  isGenerating: Record<string, boolean>;
  loadCachedSummaries: () => void;
  generateSummary: (categoryId: string, categoryName: string, articles: NewsArticle[]) => Promise<void>;
  clearSummaryError: (categoryId: string) => void;
  setSummaryFromExternal: (categoryId: string, summary: CategorySummary) => void;
}

const GeminiSummaryContext = createContext<GeminiSummaryContextValue | null>(null);

/** Provides Gemini AI summary generation and caching to the component tree. */
export const GeminiSummaryProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [summaries, setSummaries] = useState<Record<string, CategorySummary>>({});
  const [summaryErrors, setSummaryErrors] = useState<Record<string, AppError>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});

  const { incrementAndRefresh, remainingCalls } = useGeminiUsage();
  const apiKey = import.meta.env.VITE_GEMINI_KEY as string | undefined;

  const loadCachedSummaries = useCallback(() => {
    removeExpiredCache();
    const cached: Record<string, CategorySummary> = {};
    CATEGORY_IDS.forEach((categoryId) => {
      const cachedSummary = getCachedSummary(categoryId);
      if (cachedSummary) {
        cached[categoryId] = cachedSummary;
      }
    });
    setSummaries((prev) => ({ ...prev, ...cached }));
  }, []);

  useEffect(() => {
    loadCachedSummaries();
  }, [loadCachedSummaries]);

  const clearSummaryError = useCallback((categoryId: string) => {
    setSummaryErrors((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  }, []);

  const setSummaryFromExternal = useCallback((categoryId: string, summary: CategorySummary) => {
    saveSummaryToCache(categoryId, summary);
    setSummaries((prev) => ({ ...prev, [categoryId]: summary }));
  }, []);

  const generateSummary = useCallback(
    async (categoryId: string, categoryName: string, articles: NewsArticle[]) => {
      if (!apiKey || !articles.length) {
        return;
      }

      if (remainingCalls <= 0) {
        setSummaryErrors((prev) => ({ ...prev, [categoryId]: createRateLimitError(MAX_DAILY_REQUESTS) }));
        return;
      }

      setIsGenerating((prev) => ({ ...prev, [categoryId]: true }));
      clearSummaryError(categoryId);

      try {
        incrementAndRefresh();
        const result = await generateCategorySummary(apiKey, categoryId, categoryName, articles);

        if (result.error) {
          setSummaryErrors((prev) => ({ ...prev, [categoryId]: result.error! }));
        } else {
          setSummaries((prev) => ({ ...prev, [categoryId]: result.summary! }));
        }
      } catch {
        setSummaryErrors((prev) => ({
          ...prev,
          [categoryId]: createApiError('Onverwachte fout bij het genereren van de samenvatting.'),
        }));
      } finally {
        setIsGenerating((prev) => ({ ...prev, [categoryId]: false }));
      }
    },
    [apiKey, remainingCalls, incrementAndRefresh, clearSummaryError],
  );

  const value = useMemo<GeminiSummaryContextValue>(
    () => ({
      summaries,
      summaryErrors,
      isGenerating,
      loadCachedSummaries,
      generateSummary,
      clearSummaryError,
      setSummaryFromExternal,
    }),
    [summaries, summaryErrors, isGenerating, loadCachedSummaries, generateSummary, clearSummaryError, setSummaryFromExternal],
  );

  return <GeminiSummaryContext.Provider value={value}>{children}</GeminiSummaryContext.Provider>;
};

/** Accesses Gemini summary state and actions from GeminiSummaryContext. */
export const useGeminiSummary = (): GeminiSummaryContextValue => {
  const context = useContext(GeminiSummaryContext);
  if (!context) {
    throw new Error('useGeminiSummary must be used within GeminiSummaryProvider');
  }

  return context;
};

import { createContext, useCallback, useContext, useMemo, useState, type FC, type ReactNode } from 'react';

import { CATEGORY_IDS } from '@/config/feedSources.config';
import {
  generateCategorySummary,
  getCachedSummary,
  getDailyUsageCount,
  getRemainingDailyCalls,
  removeExpiredCache,
} from '@/services/geminiSummary.service';
import type { NewsArticle } from '@/types';
import type { AppError } from '@/types/errors';

interface GeminiSummaryContextValue {
  summaries: Record<string, string>;
  summaryErrors: Record<string, AppError>;
  isGenerating: Record<string, boolean>;
  isAvailable: boolean;
  dailyUsageCount: number;
  remainingCalls: number;
  loadCachedSummaries: () => void;
  generateSummary: (categoryId: string, categoryName: string, articles: NewsArticle[]) => Promise<void>;
  clearSummaryError: (categoryId: string) => void;
}

const GeminiSummaryContext = createContext<GeminiSummaryContextValue | null>(null);

/** Provides Gemini AI summary generation, caching, and usage tracking to the component tree. */
export const GeminiSummaryProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summaryErrors, setSummaryErrors] = useState<Record<string, AppError>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [dailyUsageCount, setDailyUsageCount] = useState(() => getDailyUsageCount().count);

  const apiKey = import.meta.env.VITE_GEMINI_KEY as string | undefined;
  const isAvailable = !!apiKey;

  const refreshUsageCount = useCallback(() => {
    setDailyUsageCount(getDailyUsageCount().count);
  }, []);

  const loadCachedSummaries = useCallback(() => {
    removeExpiredCache();
    const cached: Record<string, string> = {};
    CATEGORY_IDS.forEach((categoryId) => {
      const cachedText = getCachedSummary(categoryId);
      if (cachedText) {
        cached[categoryId] = cachedText;
      }
    });
    setSummaries((prev) => ({ ...prev, ...cached }));
    refreshUsageCount();
  }, [refreshUsageCount]);

  const clearSummaryError = useCallback((categoryId: string) => {
    setSummaryErrors((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  }, []);

  const generateSummary = useCallback(
    async (categoryId: string, categoryName: string, articles: NewsArticle[]) => {
      if (!apiKey || !articles.length) {
        return;
      }

      setIsGenerating((prev) => ({ ...prev, [categoryId]: true }));
      clearSummaryError(categoryId);

      try {
        const result = await generateCategorySummary(apiKey, categoryId, categoryName, articles);

        if (result.error) {
          setSummaryErrors((prev) => ({ ...prev, [categoryId]: result.error! }));
        } else {
          setSummaries((prev) => ({ ...prev, [categoryId]: result.text! }));
        }

        refreshUsageCount();
      } catch {
        setSummaryErrors((prev) => ({
          ...prev,
          [categoryId]: { type: 'ApiError', message: 'Onverwachte fout bij het genereren van de samenvatting.' },
        }));
      } finally {
        setIsGenerating((prev) => ({ ...prev, [categoryId]: false }));
      }
    },
    [apiKey, refreshUsageCount, clearSummaryError],
  );

  const remainingCalls = getRemainingDailyCalls();

  const value = useMemo<GeminiSummaryContextValue>(
    () => ({
      summaries,
      summaryErrors,
      isGenerating,
      isAvailable,
      dailyUsageCount,
      remainingCalls,
      loadCachedSummaries,
      generateSummary,
      clearSummaryError,
    }),
    [
      summaries,
      summaryErrors,
      isGenerating,
      isAvailable,
      dailyUsageCount,
      remainingCalls,
      loadCachedSummaries,
      generateSummary,
      clearSummaryError,
    ],
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

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type FC, type ReactNode } from 'react';

import { OUTLOOK_EXCLUDED_CATEGORIES } from '@/config/app.config';
import { CATEGORY_IDS, FEED_SOURCES } from '@/config/feedSources.config';
import {
  generateBatchOutlooks,
  generateCategoryOutlook,
  getCachedOutlook,
  removeExpiredOutlookCache,
  type CategoryInput,
} from '@/services/geminiOutlook.service';
import type { CategoryOutlook, NewsArticle } from '@/types';
import type { AppError } from '@/types/errors';

import { useGeminiUsage } from './GeminiUsageContext';

interface GeminiOutlookContextValue {
  outlooks: Record<string, CategoryOutlook>;
  outlookErrors: Record<string, AppError>;
  isGeneratingOutlook: Record<string, boolean>;
  generateAllOutlooks: (articlesByCategory: Record<string, NewsArticle[]>) => Promise<void>;
  refreshOutlook: (categoryId: string, categoryName: string, articles: NewsArticle[]) => Promise<void>;
}

const GeminiOutlookContext = createContext<GeminiOutlookContextValue | null>(null);

const CATEGORY_NAMES: Record<string, string> = {};
for (const src of FEED_SOURCES) {
  CATEGORY_NAMES[src.categoryId] = src.label;
}

/** Provides AI-generated long-term outlook state and generation actions to the component tree. */
export const GeminiOutlookProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [outlooks, setOutlooks] = useState<Record<string, CategoryOutlook>>({});
  const [outlookErrors, setOutlookErrors] = useState<Record<string, AppError>>({});
  const [isGeneratingOutlook, setIsGeneratingOutlook] = useState<Record<string, boolean>>({});

  const { refreshUsageCount } = useGeminiUsage();
  const apiKey = import.meta.env.VITE_GEMINI_KEY as string | undefined;

  const clearOutlookError = useCallback((categoryId: string) => {
    setOutlookErrors((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  }, []);

  const loadCachedOutlooks = useCallback(() => {
    removeExpiredOutlookCache();
    const cached: Record<string, CategoryOutlook> = {};
    CATEGORY_IDS.forEach((id) => {
      const entry = getCachedOutlook(id);
      if (entry) cached[id] = entry;
    });
    if (Object.keys(cached).length > 0) {
      setOutlooks((prev) => ({ ...prev, ...cached }));
    }
  }, []);

  useEffect(() => {
    loadCachedOutlooks();
  }, [loadCachedOutlooks]);

  const isBatchRunning = useRef(false);

  const generateAllOutlooks = useCallback(
    async (articlesByCategory: Record<string, NewsArticle[]>) => {
      if (!apiKey || isBatchRunning.current) return;

      removeExpiredOutlookCache();

      const uncached: Record<string, CategoryInput> = {};
      for (const id of CATEGORY_IDS) {
        if (OUTLOOK_EXCLUDED_CATEGORIES.includes(id)) continue;
        if (getCachedOutlook(id)) continue;
        const articles = articlesByCategory[id];
        if (!articles?.length) continue;
        uncached[id] = { name: CATEGORY_NAMES[id] ?? id, articles };
      }

      if (Object.keys(uncached).length === 0) return;

      isBatchRunning.current = true;
      const uncachedIds = Object.keys(uncached);

      setIsGeneratingOutlook((prev) => {
        const next = { ...prev };
        for (const id of uncachedIds) next[id] = true;
        return next;
      });

      try {
        const result = await generateBatchOutlooks(apiKey, uncached);

        if (Object.keys(result.outlooks).length > 0) {
          setOutlooks((prev) => ({ ...prev, ...result.outlooks }));
        }
        if (Object.keys(result.errors).length > 0) {
          setOutlookErrors((prev) => ({ ...prev, ...result.errors }));
        }

        refreshUsageCount();
      } catch {
        const fallbackError: AppError = { type: 'ApiError', message: 'Onverwachte fout bij batch outlook.' };
        setOutlookErrors((prev) => {
          const next = { ...prev };
          for (const id of uncachedIds) next[id] = fallbackError;
          return next;
        });
      } finally {
        setIsGeneratingOutlook((prev) => {
          const next = { ...prev };
          for (const id of uncachedIds) next[id] = false;
          return next;
        });
        isBatchRunning.current = false;
      }
    },
    [apiKey, refreshUsageCount],
  );

  const refreshSingle = useCallback(
    async (categoryId: string, categoryName: string, articles: NewsArticle[]) => {
      if (!apiKey || !articles.length) return;

      setIsGeneratingOutlook((prev) => ({ ...prev, [categoryId]: true }));
      clearOutlookError(categoryId);

      try {
        const result = await generateCategoryOutlook(apiKey, categoryId, categoryName, articles);

        if (result.error) {
          setOutlookErrors((prev) => ({ ...prev, [categoryId]: result.error! }));
        } else {
          setOutlooks((prev) => ({ ...prev, [categoryId]: result.outlook! }));
        }

        refreshUsageCount();
      } catch {
        setOutlookErrors((prev) => ({
          ...prev,
          [categoryId]: { type: 'ApiError', message: 'Onverwachte fout bij het genereren van de outlook.' },
        }));
      } finally {
        setIsGeneratingOutlook((prev) => ({ ...prev, [categoryId]: false }));
      }
    },
    [apiKey, clearOutlookError, refreshUsageCount],
  );

  const value = useMemo<GeminiOutlookContextValue>(
    () => ({
      outlooks,
      outlookErrors,
      isGeneratingOutlook,
      generateAllOutlooks,
      refreshOutlook: refreshSingle,
    }),
    [outlooks, outlookErrors, isGeneratingOutlook, generateAllOutlooks, refreshSingle],
  );

  return <GeminiOutlookContext.Provider value={value}>{children}</GeminiOutlookContext.Provider>;
};

/** Accesses Gemini outlook state and actions from GeminiOutlookContext. */
export const useGeminiOutlook = (): GeminiOutlookContextValue => {
  const context = useContext(GeminiOutlookContext);
  if (!context) {
    throw new Error('useGeminiOutlook must be used within GeminiOutlookProvider');
  }
  return context;
};

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type FC, type ReactNode } from 'react';

import { CATEGORY_IDS } from '@/config/feedSources.config';
import {
  generateCategoryAnalysis,
  generateCategoryOutlook,
  getCachedOutlook,
  removeExpiredOutlookCache,
} from '@/services/geminiOutlook.service';
import { getCachedSummary } from '@/services/geminiSummary.service';
import type { CategoryOutlook, NewsArticle, OutlookStep } from '@/types';
import { createApiError, type AppError } from '@/types/errors';

import { useGeminiSummary } from './GeminiSummaryContext';
import { useGeminiUsage } from './GeminiUsageContext';

interface GeminiOutlookContextValue {
  outlooks: Record<string, CategoryOutlook>;
  outlookErrors: Record<string, AppError>;
  outlookProgress: Record<string, OutlookStep | null>;
  loadOrGenerateOutlook: (categoryId: string, categoryName: string, articles: NewsArticle[]) => Promise<void>;
  refreshOutlook: (categoryId: string, categoryName: string, articles: NewsArticle[]) => Promise<void>;
}

const GeminiOutlookContext = createContext<GeminiOutlookContextValue | null>(null);

/** Provides AI-generated long-term outlook state and generation actions to the component tree. */
export const GeminiOutlookProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [outlooks, setOutlooks] = useState<Record<string, CategoryOutlook>>({});
  const [outlookErrors, setOutlookErrors] = useState<Record<string, AppError>>({});
  const [outlookProgress, setOutlookProgress] = useState<Record<string, OutlookStep | null>>({});

  const { incrementAndRefresh } = useGeminiUsage();
  const { setSummaryFromExternal } = useGeminiSummary();
  const apiKey = import.meta.env.VITE_GEMINI_KEY as string | undefined;

  const clearOutlookError = useCallback((categoryId: string) => {
    setOutlookErrors((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  }, []);

  useEffect(() => {
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

  const outlooksRef = useRef(outlooks);
  outlooksRef.current = outlooks;

  const loadOrGenerateOutlook = useCallback(
    async (categoryId: string, categoryName: string, articles: NewsArticle[]) => {
      if (!apiKey || !articles.length) return;

      if (outlooksRef.current[categoryId]) return;

      const cachedOutlook = getCachedOutlook(categoryId);
      if (cachedOutlook) {
        setOutlooks((prev) => ({ ...prev, [categoryId]: cachedOutlook }));
        return;
      }

      setOutlookProgress((prev) => ({ ...prev, [categoryId]: 'analyzing' }));
      clearOutlookError(categoryId);

      try {
        setOutlookProgress((prev) => ({ ...prev, [categoryId]: 'generating' }));
        incrementAndRefresh();

        const summaryAlreadyCached = !!getCachedSummary(categoryId);

        if (summaryAlreadyCached) {
          const result = await generateCategoryOutlook(apiKey, categoryId, categoryName, articles);

          setOutlookProgress((prev) => ({ ...prev, [categoryId]: 'rendering' }));

          if (result.error) {
            setOutlookErrors((prev) => ({ ...prev, [categoryId]: result.error! }));
          } else {
            setOutlooks((prev) => ({ ...prev, [categoryId]: result.outlook! }));
          }
        } else {
          const result = await generateCategoryAnalysis(apiKey, categoryId, categoryName, articles);

          setOutlookProgress((prev) => ({ ...prev, [categoryId]: 'rendering' }));

          if (result.error) {
            setOutlookErrors((prev) => ({ ...prev, [categoryId]: result.error! }));
          } else {
            setOutlooks((prev) => ({ ...prev, [categoryId]: result.outlook! }));
            setSummaryFromExternal(categoryId, result.summary!);
          }
        }
      } catch {
        setOutlookErrors((prev) => ({
          ...prev,
          [categoryId]: createApiError('Onverwachte fout bij het genereren van de outlook.'),
        }));
      } finally {
        setOutlookProgress((prev) => ({ ...prev, [categoryId]: null }));
      }
    },
    [apiKey, incrementAndRefresh, clearOutlookError, setSummaryFromExternal],
  );

  const refreshOutlook = useCallback(
    async (categoryId: string, categoryName: string, articles: NewsArticle[]) => {
      if (!apiKey || !articles.length) return;

      setOutlookProgress((prev) => ({ ...prev, [categoryId]: 'analyzing' }));
      clearOutlookError(categoryId);

      try {
        setOutlookProgress((prev) => ({ ...prev, [categoryId]: 'generating' }));
        incrementAndRefresh();

        const result = await generateCategoryOutlook(apiKey, categoryId, categoryName, articles);

        setOutlookProgress((prev) => ({ ...prev, [categoryId]: 'rendering' }));

        if (result.error) {
          setOutlookErrors((prev) => ({ ...prev, [categoryId]: result.error! }));
        } else {
          setOutlooks((prev) => ({ ...prev, [categoryId]: result.outlook! }));
        }
      } catch {
        setOutlookErrors((prev) => ({
          ...prev,
          [categoryId]: createApiError('Onverwachte fout bij het genereren van de outlook.'),
        }));
      } finally {
        setOutlookProgress((prev) => ({ ...prev, [categoryId]: null }));
      }
    },
    [apiKey, incrementAndRefresh, clearOutlookError],
  );

  const value = useMemo<GeminiOutlookContextValue>(
    () => ({
      outlooks,
      outlookErrors,
      outlookProgress,
      loadOrGenerateOutlook,
      refreshOutlook,
    }),
    [outlooks, outlookErrors, outlookProgress, loadOrGenerateOutlook, refreshOutlook],
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

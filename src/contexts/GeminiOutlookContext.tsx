import { createContext, useCallback, useContext, useMemo, useState, type FC, type ReactNode } from 'react';

import {
  generateCategoryOutlook,
  getCachedOutlook,
  removeExpiredOutlookCache,
} from '@/services/geminiOutlook.service';
import type { CategoryOutlook, NewsArticle } from '@/types';
import type { AppError } from '@/types/errors';

import { useGeminiUsage } from './GeminiUsageContext';

interface GeminiOutlookContextValue {
  outlooks: Record<string, CategoryOutlook>;
  outlookErrors: Record<string, AppError>;
  isGeneratingOutlook: Record<string, boolean>;
  loadOrGenerateOutlook: (categoryId: string, categoryName: string, articles: NewsArticle[]) => Promise<void>;
  refreshOutlook: (categoryId: string, categoryName: string, articles: NewsArticle[]) => Promise<void>;
  clearOutlookError: (categoryId: string) => void;
}

const GeminiOutlookContext = createContext<GeminiOutlookContextValue | null>(null);

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

  const generate = useCallback(
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

  const loadOrGenerateOutlook = useCallback(
    async (categoryId: string, categoryName: string, articles: NewsArticle[]) => {
      if (outlooks[categoryId]) return;

      removeExpiredOutlookCache();
      const cached = getCachedOutlook(categoryId);
      if (cached) {
        setOutlooks((prev) => ({ ...prev, [categoryId]: cached }));
        return;
      }

      await generate(categoryId, categoryName, articles);
    },
    [outlooks, generate],
  );

  const refreshOutlook = useCallback(
    async (categoryId: string, categoryName: string, articles: NewsArticle[]) => {
      await generate(categoryId, categoryName, articles);
    },
    [generate],
  );

  const value = useMemo<GeminiOutlookContextValue>(
    () => ({
      outlooks,
      outlookErrors,
      isGeneratingOutlook,
      loadOrGenerateOutlook,
      refreshOutlook,
      clearOutlookError,
    }),
    [outlooks, outlookErrors, isGeneratingOutlook, loadOrGenerateOutlook, refreshOutlook, clearOutlookError],
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

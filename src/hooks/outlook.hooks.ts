import { useCallback, useEffect, useRef } from 'react';

import { useGeminiOutlook } from '@/contexts/GeminiOutlookContext';
import { useGeminiUsage } from '@/contexts/GeminiUsageContext';
import type { CategoryOutlook, NewsArticle, OutlookStep } from '@/types';
import type { AppError } from '@/types/errors';

interface OutlookResult {
  outlook: CategoryOutlook | undefined;
  error: AppError | undefined;
  outlookStep: OutlookStep | null;
  isAvailable: boolean;
  remainingCalls: number;
  refresh: () => void;
}

/** Loads or generates the outlook for a category on first mount and exposes a manual refresh action. */
export const useOutlook = (
  categoryId: string,
  categoryName: string,
  articles: NewsArticle[],
): OutlookResult => {
  const { outlooks, outlookErrors, outlookProgress, loadOrGenerateOutlook, refreshOutlook } = useGeminiOutlook();
  const { isAvailable, remainingCalls } = useGeminiUsage();

  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current || !articles.length) return;
    hasTriggered.current = true;
    loadOrGenerateOutlook(categoryId, categoryName, articles);
  }, [categoryId, categoryName, articles, loadOrGenerateOutlook]);

  const refresh = useCallback(() => {
    refreshOutlook(categoryId, categoryName, articles);
  }, [refreshOutlook, categoryId, categoryName, articles]);

  return {
    outlook: outlooks[categoryId],
    error: outlookErrors[categoryId],
    outlookStep: outlookProgress[categoryId] ?? null,
    isAvailable,
    remainingCalls,
    refresh,
  };
};

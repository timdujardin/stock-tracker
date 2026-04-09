import { useEffect, useRef } from 'react';

import { useGeminiOutlook } from '@/contexts/GeminiOutlookContext';
import { useGeminiUsage } from '@/contexts/GeminiUsageContext';
import type { CategoryOutlook, NewsArticle } from '@/types';
import type { AppError } from '@/types/errors';

interface AutoOutlookResult {
  outlook: CategoryOutlook | undefined;
  error: AppError | undefined;
  isGenerating: boolean;
  isAvailable: boolean;
  remainingCalls: number;
  refresh: () => void;
}

/** Automatically loads or generates a long-term outlook when a category mounts. */
export const useAutoOutlook = (
  categoryId: string,
  categoryName: string,
  articles: NewsArticle[],
): AutoOutlookResult => {
  const { outlooks, outlookErrors, isGeneratingOutlook, loadOrGenerateOutlook, refreshOutlook } = useGeminiOutlook();
  const { isAvailable, remainingCalls } = useGeminiUsage();

  const hasTriggered = useRef(false);
  const prevCategoryId = useRef(categoryId);

  if (prevCategoryId.current !== categoryId) {
    hasTriggered.current = false;
    prevCategoryId.current = categoryId;
  }

  useEffect(() => {
    if (hasTriggered.current || !isAvailable || !articles.length) return;
    hasTriggered.current = true;
    loadOrGenerateOutlook(categoryId, categoryName, articles);
  }, [categoryId, categoryName, articles, isAvailable, loadOrGenerateOutlook]);

  const refresh = () => {
    refreshOutlook(categoryId, categoryName, articles);
  };

  return {
    outlook: outlooks[categoryId],
    error: outlookErrors[categoryId],
    isGenerating: isGeneratingOutlook[categoryId] ?? false,
    isAvailable,
    remainingCalls,
    refresh,
  };
};

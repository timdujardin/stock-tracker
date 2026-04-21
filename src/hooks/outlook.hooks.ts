import { useGeminiOutlook } from '@/contexts/GeminiOutlookContext';
import { useGeminiUsage } from '@/contexts/GeminiUsageContext';
import type { CategoryOutlook, NewsArticle } from '@/types';
import type { AppError } from '@/types/errors';

interface OutlookResult {
  outlook: CategoryOutlook | undefined;
  error: AppError | undefined;
  isGenerating: boolean;
  isAvailable: boolean;
  remainingCalls: number;
  refresh: () => void;
}

/** Reads the outlook for a category and exposes a manual refresh action. */
export const useOutlook = (
  categoryId: string,
  categoryName: string,
  articles: NewsArticle[],
): OutlookResult => {
  const { outlooks, outlookErrors, isGeneratingOutlook, refreshOutlook } = useGeminiOutlook();
  const { isAvailable, remainingCalls } = useGeminiUsage();

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

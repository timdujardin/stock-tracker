import { useEffect, useRef } from 'react';

import { CATEGORY_IDS } from '@/config/feedSources.config';
import { useGeminiOutlook } from '@/contexts/GeminiOutlookContext';
import { useNewsFeed } from '@/contexts/NewsFeedContext';
import type { NewsArticle } from '@/types';

/** Triggers a feed refresh on mount and batches outlook generation when articles arrive. */
export const useAutoRefresh = () => {
  const { refreshFeed, articles, getArticlesForCategory } = useNewsFeed();
  const { generateAllOutlooks } = useGeminiOutlook();
  const hasTriggeredOutlooks = useRef(false);

  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);

  useEffect(() => {
    if (hasTriggeredOutlooks.current || !articles.length) return;
    hasTriggeredOutlooks.current = true;

    const byCategory: Record<string, NewsArticle[]> = {};
    for (const id of CATEGORY_IDS) {
      byCategory[id] = getArticlesForCategory(id);
    }
    generateAllOutlooks(byCategory);
  }, [articles, getArticlesForCategory, generateAllOutlooks]);
};

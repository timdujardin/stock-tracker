import { useEffect } from 'react';

import { useGeminiSummary } from '@/contexts/GeminiSummaryContext';
import { useNewsFeed } from '@/contexts/NewsFeedContext';

/** Triggers a feed refresh on mount and loads cached summaries when articles are available. */
/** @returns void */
export const useAutoRefresh = () => {
  const { refreshFeed, articles } = useNewsFeed();
  const { loadCachedSummaries } = useGeminiSummary();

  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);

  useEffect(() => {
    if (articles.length > 0) {
      loadCachedSummaries();
    }
  }, [articles.length, loadCachedSummaries]);
};

import { useMemo } from 'react';

import type { NewsArticle } from '@/types';
import { aggregateDailySentiment, type DailySentiment } from '@/utils/sentimentTrend.util';

/** Returns memoized daily sentiment trend data for a set of articles. */
export const useSentimentTrend = (articles: NewsArticle[]): DailySentiment[] => {
  return useMemo(() => aggregateDailySentiment(articles), [articles]);
};

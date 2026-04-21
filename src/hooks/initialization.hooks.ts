import { useEffect } from 'react';

import { useNewsFeed } from '@/contexts/NewsFeedContext';

/** Triggers a feed refresh on mount. */
export const useAutoRefresh = () => {
  const { refreshFeed } = useNewsFeed();

  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);
};

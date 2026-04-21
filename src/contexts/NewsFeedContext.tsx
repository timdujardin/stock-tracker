import { createContext, useCallback, useContext, useMemo, useState, type FC, type ReactNode } from 'react';

import { fetchAllNewsArticles } from '@/services/newsFeed.service';
import type { NewsArticle } from '@/types';
import type { AppError } from '@/types/errors';
import { filterArticlesByCategory } from '@/utils/articleSorting.util';

interface NewsFeedState {
  articles: NewsArticle[];
  isLoading: boolean;
  statusText: string;
  feedError: AppError | null;
  failedFeedCount: number;
}

interface NewsFeedContextValue extends NewsFeedState {
  refreshFeed: () => Promise<void>;
  getArticlesForCategory: (categoryId: string) => NewsArticle[];
}

const NewsFeedContext = createContext<NewsFeedContextValue | null>(null);

/** Provides news feed state, refresh logic, and category filtering to the component tree. */
export const NewsFeedProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NewsFeedState>({
    articles: [],
    isLoading: false,
    statusText: 'Laden…',
    feedError: null,
    failedFeedCount: 0,
  });

  const refreshFeed = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      articles: [],
      isLoading: true,
      statusText: 'Ophalen…',
      feedError: null,
      failedFeedCount: 0,
    }));

    const result = await fetchAllNewsArticles(() => {});

    const now = new Date();
    const date = now.toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' });
    const time = now.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });

    const statusParts = [`${date} ${time}`];
    if (result.failedFeeds > 0) {
      statusParts.push(`(${result.failedFeeds} bronnen niet bereikbaar)`);
    }

    setState((prev) => ({
      ...prev,
      articles: result.articles,
      isLoading: false,
      feedError: result.error,
      failedFeedCount: result.failedFeeds,
      statusText: statusParts.join(' '),
    }));
  }, []);

  const getArticlesForCategory = useCallback(
    (categoryId: string) => {
      return filterArticlesByCategory(state.articles, categoryId);
    },
    [state.articles],
  );

  const value = useMemo<NewsFeedContextValue>(
    () => ({
      ...state,
      refreshFeed,
      getArticlesForCategory,
    }),
    [state, refreshFeed, getArticlesForCategory],
  );

  return <NewsFeedContext.Provider value={value}>{children}</NewsFeedContext.Provider>;
};

/** Accesses the news feed state and actions from NewsFeedContext. */
export const useNewsFeed = (): NewsFeedContextValue => {
  const context = useContext(NewsFeedContext);
  if (!context) {
    throw new Error('useNewsFeed must be used within NewsFeedProvider');
  }

  return context;
};

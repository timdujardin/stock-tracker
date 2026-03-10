import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { CATEGORY_IDS } from '../config/feedSources.config'
import { fetchAllNewsArticles } from '../services/newsFeed.service'
import type { NewsArticle, Sentiment } from '../types'
import type { AppError } from '../types/errors'

interface NewsFeedState {
  articles: NewsArticle[]
  isLoading: boolean
  statusText: string
  feedError: AppError | null
  failedFeedCount: number
  categoryFilter: string
  sentimentFilter: string
}

interface NewsFeedContextValue extends NewsFeedState {
  filteredArticles: NewsArticle[]
  setCategoryFilter: (categoryId: string) => void
  setSentimentFilter: (sentiment: string) => void
  refreshFeed: () => Promise<void>
  getArticlesForCategory: (categoryId: string) => NewsArticle[]
  countBySentiment: (sentiment: Sentiment) => number
}

const NewsFeedContext = createContext<NewsFeedContextValue | null>(null)

export function NewsFeedProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NewsFeedState>({
    articles: [],
    isLoading: false,
    statusText: 'Laden…',
    feedError: null,
    failedFeedCount: 0,
    categoryFilter: 'all',
    sentimentFilter: 'all',
  })

  const refreshFeed = useCallback(async () => {
    setState(prev => ({
      ...prev,
      articles: [],
      isLoading: true,
      statusText: 'Ophalen…',
      feedError: null,
      failedFeedCount: 0,
    }))

    const result = await fetchAllNewsArticles((completed, total) => {
      setState(prev => ({ ...prev, statusText: `Ophalen ${completed}/${total}` }))
    })

    const timestamp = new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })

    const statusParts = [`${timestamp} · ${result.articles.length} artikels`]
    if (result.failedFeeds > 0) {
      statusParts.push(`(${result.failedFeeds} bronnen niet bereikbaar)`)
    }

    setState(prev => ({
      ...prev,
      articles: result.articles,
      isLoading: false,
      feedError: result.error,
      failedFeedCount: result.failedFeeds,
      statusText: statusParts.join(' '),
    }))
  }, [])

  const setCategoryFilter = useCallback((categoryId: string) => {
    setState(prev => ({ ...prev, categoryFilter: categoryId }))
  }, [])

  const setSentimentFilter = useCallback((sentiment: string) => {
    setState(prev => ({ ...prev, sentimentFilter: sentiment }))
  }, [])

  const filteredArticles = useMemo(() => {
    return state.articles
      .filter(article =>
        state.categoryFilter === 'all' ||
        (CATEGORY_IDS.includes(state.categoryFilter) &&
          (article.categoryId === state.categoryFilter || article.matchedTopics.includes(state.categoryFilter)))
      )
      .filter(article =>
        state.sentimentFilter === 'all' || article.sentiment === state.sentimentFilter
      )
  }, [state.articles, state.categoryFilter, state.sentimentFilter])

  const getArticlesForCategory = useCallback((categoryId: string) => {
    return filteredArticles.filter(article => article.categoryId === categoryId)
  }, [filteredArticles])

  const countBySentiment = useCallback((sentiment: Sentiment) => {
    return state.articles.filter(article =>
      (state.categoryFilter === 'all' ||
        article.categoryId === state.categoryFilter ||
        article.matchedTopics.includes(state.categoryFilter)) &&
      article.sentiment === sentiment
    ).length
  }, [state.articles, state.categoryFilter])

  const value: NewsFeedContextValue = {
    ...state,
    filteredArticles,
    setCategoryFilter,
    setSentimentFilter,
    refreshFeed,
    getArticlesForCategory,
    countBySentiment,
  }

  return (
    <NewsFeedContext.Provider value={value}>
      {children}
    </NewsFeedContext.Provider>
  )
}

export function useNewsFeed(): NewsFeedContextValue {
  const context = useContext(NewsFeedContext)
  if (!context) throw new Error('useNewsFeed must be used within NewsFeedProvider')
  return context
}

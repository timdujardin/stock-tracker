import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { fetchAllNewsArticles } from '../services/newsFeed.service'
import type { NewsArticle } from '../types'
import type { AppError } from '../types/errors'

interface NewsFeedState {
  articles: NewsArticle[]
  isLoading: boolean
  statusText: string
  feedError: AppError | null
  failedFeedCount: number
}

interface NewsFeedContextValue extends NewsFeedState {
  refreshFeed: () => Promise<void>
  getArticlesForCategory: (categoryId: string) => NewsArticle[]
}

const NewsFeedContext = createContext<NewsFeedContextValue | null>(null)

export function NewsFeedProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NewsFeedState>({
    articles: [],
    isLoading: false,
    statusText: 'Laden…',
    feedError: null,
    failedFeedCount: 0,
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

  const getArticlesForCategory = useCallback((categoryId: string) => {
    return state.articles.filter(article => article.categoryId === categoryId)
  }, [state.articles])

  const value: NewsFeedContextValue = {
    ...state,
    refreshFeed,
    getArticlesForCategory,
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

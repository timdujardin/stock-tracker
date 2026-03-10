import { useEffect } from 'react'
import { useNewsFeed } from '../contexts/NewsFeedContext'
import { useGeminiSummary } from '../contexts/GeminiSummaryContext'

export function useAutoRefresh() {
  const { refreshFeed, articles } = useNewsFeed()
  const { loadCachedSummaries } = useGeminiSummary()

  useEffect(() => {
    refreshFeed()
  }, [refreshFeed])

  useEffect(() => {
    if (articles.length > 0) loadCachedSummaries()
  }, [articles.length, loadCachedSummaries])
}

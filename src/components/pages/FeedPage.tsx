import { useNewsFeed } from '../../contexts/NewsFeedContext'
import { createNotFoundError } from '../../types/errors'
import { ErrorDisplay } from '../atoms/ErrorDisplay'
import { CategoryFeed } from '../organisms/CategoryFeed'
import { SkeletonFeed } from '../organisms/SkeletonFeed'

export function FeedPage() {
  const { articles, isLoading, feedError, refreshFeed } = useNewsFeed()

  if (isLoading && !articles.length) return <SkeletonFeed />

  if (feedError && !articles.length) {
    return <ErrorDisplay error={feedError} onRetry={refreshFeed} />
  }

  if (!articles.length) {
    return (
      <ErrorDisplay
        error={createNotFoundError('Geen artikels gevonden.')}
        onRetry={refreshFeed}
      />
    )
  }

  return <CategoryFeed />
}

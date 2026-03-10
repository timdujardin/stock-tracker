import { useNewsFeed } from '../../contexts/NewsFeedContext'
import { useWindowWidth } from '../../hooks/layout.hooks'
import { createNotFoundError } from '../../types/errors'
import { ErrorDisplay } from '../atoms/ErrorDisplay'
import { CategoryGrid } from '../organisms/CategoryGrid'
import { ArticleTimeline } from '../organisms/ArticleTimeline'
import { SkeletonCategoryGrid } from '../organisms/SkeletonCategoryGrid'
import { SkeletonTimeline } from '../organisms/SkeletonTimeline'

export function FeedPage() {
  const { filteredArticles, isLoading, articles, categoryFilter, feedError, refreshFeed } = useNewsFeed()
  const windowWidth = useWindowWidth()

  const isDesktop = windowWidth >= 1024
  const showColumnView = isDesktop && categoryFilter === 'all'

  if (isLoading && !articles.length) {
    return showColumnView ? <SkeletonCategoryGrid /> : <SkeletonTimeline />
  }

  if (feedError && !articles.length) {
    return <ErrorDisplay error={feedError} onRetry={refreshFeed} />
  }

  if (!filteredArticles.length) {
    return (
      <ErrorDisplay
        error={createNotFoundError('Geen artikels gevonden voor de huidige filters.')}
        onRetry={refreshFeed}
      />
    )
  }

  return showColumnView ? <CategoryGrid /> : <ArticleTimeline />
}

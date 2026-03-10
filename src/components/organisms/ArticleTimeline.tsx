import { useNewsFeed } from '../../contexts/NewsFeedContext'
import { useWeekBuckets } from '../../hooks/articleAnalysis.hooks'
import { getSelectedCategory } from '../../utils/categoryLookup.util'
import { DaySummary } from '../molecules/DaySummary'
import { WeekBucketSection } from '../molecules/WeekBucketSection'

const WEEK_BUCKET_CONFIG = {
  thisWeek: { label: 'Deze week', wrapperClass: 'wd-d', dotClass: 'dot-d', textClass: 'txt-d', countClass: 'cnt-d' },
  lastWeek: { label: 'Vorige week', wrapperClass: 'wd-v', dotClass: 'dot-v', textClass: 'txt-v', countClass: 'cnt-v' },
  older:    { label: 'Ouder', wrapperClass: 'wd-o', dotClass: 'dot-o', textClass: 'txt-o', countClass: 'cnt-o' },
} as const

export function ArticleTimeline() {
  const { filteredArticles, categoryFilter } = useNewsFeed()
  const { buckets, collapsedBuckets, toggleBucket } = useWeekBuckets(filteredArticles)

  const selectedCategory = getSelectedCategory(categoryFilter)

  return (
    <>
      {selectedCategory && (
        <DaySummary
          articles={filteredArticles}
          categoryId={selectedCategory.categoryId}
          categoryName={selectedCategory.label}
          className="mob-sum"
        />
      )}

      {(['thisWeek', 'lastWeek', 'older'] as const).map(bucketKey => {
        const bucketArticles = buckets[bucketKey]
        if (!bucketArticles.length) return null

        return (
          <WeekBucketSection
            key={bucketKey}
            articles={bucketArticles}
            config={WEEK_BUCKET_CONFIG[bucketKey]}
            isCollapsed={!!collapsedBuckets[bucketKey]}
            onToggle={() => toggleBucket(bucketKey)}
          />
        )
      })}
    </>
  )
}

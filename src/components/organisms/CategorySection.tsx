import type { NewsCategory } from '../../types'
import { useNewsFeed } from '../../contexts/NewsFeedContext'
import { useSentimentCounts } from '../../hooks/articleAnalysis.hooks'
import { SentimentBar } from '../atoms/SentimentBar'
import { DaySummary } from '../molecules/DaySummary'
import { ArticleSlider } from '../molecules/ArticleSlider'

interface CategorySectionProps {
  category: NewsCategory
}

export function CategorySection({ category }: CategorySectionProps) {
  const { getArticlesForCategory } = useNewsFeed()

  const allArticles = getArticlesForCategory(category.categoryId)
  const sortedArticles = [...allArticles]
    .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
    .slice(0, 20)

  const { positiveCount, negativeCount, neutralCount } = useSentimentCounts(sortedArticles)

  if (!sortedArticles.length) return null

  return (
    <section className="cat-section">
      <div className={`cat-section-hdr ${category.themeClass}`}>
        <span className="cat-section-label">
          {category.icon} {category.label}
          <span className="cat-section-count">({sortedArticles.length})</span>
        </span>
        <SentimentBar
          positiveCount={positiveCount}
          negativeCount={negativeCount}
          neutralCount={neutralCount}
          className="cat-section-bar"
        />
        <span className="cat-section-stats">
          {positiveCount > 0 && <span className="pp">↑{positiveCount}</span>}
          {negativeCount > 0 && <span className="pn">↓{negativeCount}</span>}
          {neutralCount > 0 && <span className="pu">→{neutralCount}</span>}
        </span>
      </div>

      <DaySummary
        articles={sortedArticles}
        categoryId={category.categoryId}
        categoryName={category.label}
        className="cat-section-sum"
      />

      <ArticleSlider articles={sortedArticles} />
    </section>
  )
}

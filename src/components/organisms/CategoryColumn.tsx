import { useState } from 'react'
import type { NewsCategory } from '../../types'
import { useNewsFeed } from '../../contexts/NewsFeedContext'
import { useSentimentCounts } from '../../hooks/articleAnalysis.hooks'
import { SentimentChart } from '../molecules/SentimentChart'
import { DaySummary } from '../molecules/DaySummary'
import { ArticleCard } from '../molecules/ArticleCard'

interface CategoryColumnProps {
  category: NewsCategory
}

export function CategoryColumn({ category }: CategoryColumnProps) {
  const { getArticlesForCategory } = useNewsFeed()
  const [isExpanded, setIsExpanded] = useState(false)

  const allArticles = getArticlesForCategory(category.categoryId)
  const sortedArticles = [...allArticles]
    .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
    .slice(0, 20)

  const displayedArticles = isExpanded ? sortedArticles : sortedArticles.slice(0, 10)
  const { positiveCount, negativeCount, neutralCount } = useSentimentCounts(sortedArticles)

  return (
    <div className="feed-col">
      <div className={`feed-col-hdr ${category.themeClass}`}>
        {category.icon} {category.label}{' '}
        <span style={{ opacity: 0.7, fontWeight: 600 }}>({sortedArticles.length})</span>
      </div>

      <SentimentChart
        positiveCount={positiveCount}
        negativeCount={negativeCount}
        neutralCount={neutralCount}
      />

      <DaySummary
        articles={sortedArticles}
        categoryId={category.categoryId}
        categoryName={category.label}
      />

      <div className="feed-col-items">
        {displayedArticles.map((article, index) => (
          <ArticleCard key={index} article={article} hideCategoryId={category.categoryId} />
        ))}
      </div>

      {sortedArticles.length > 10 && !isExpanded && (
        <div className="feed-col-more">
          <button onClick={() => setIsExpanded(true)}>Volgende 10</button>
        </div>
      )}
    </div>
  )
}

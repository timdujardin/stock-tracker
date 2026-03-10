import { useState } from 'react'
import { CompactArticleCard } from '../atoms/CompactArticleCard'
import type { NewsArticle } from '../../types'

interface ArticleSliderProps {
  articles: NewsArticle[]
}

const PAGE_SIZE = 10

export function ArticleSlider({ articles }: ArticleSliderProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const displayedArticles = articles.slice(0, visibleCount)
  const hasMore = articles.length > visibleCount

  return (
    <div className="article-slider">
      {displayedArticles.map((article, index) => (
        <CompactArticleCard key={index} article={article} />
      ))}
      {hasMore && (
        <button
          className="slider-load-more"
          onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
        >
          +{Math.min(PAGE_SIZE, articles.length - visibleCount)} meer
        </button>
      )}
    </div>
  )
}

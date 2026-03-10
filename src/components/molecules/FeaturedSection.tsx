import { useMemo } from 'react'
import { SENTIMENT_DISPLAY } from '../../config/sentimentKeywords.config'
import { formatTimeAgo } from '../../utils/timeFormatting.util'
import { getCategoryById } from '../../utils/categoryLookup.util'
import { getFeaturedArticles } from '../../utils/featuredArticles.util'
import type { NewsArticle } from '../../types'

interface FeaturedSectionProps {
  articles: NewsArticle[]
}

export function FeaturedSection({ articles }: FeaturedSectionProps) {
  const featuredArticles = useMemo(() => getFeaturedArticles(articles), [articles])

  if (!featuredArticles.length) return null

  return (
    <section className="featured-section">
      <h2 className="featured-heading">Uitgelicht</h2>
      <div className="featured-cards">
        {featuredArticles.map(article => {
          const category = getCategoryById(article.categoryId)
          const sentimentStyle = SENTIMENT_DISPLAY[article.sentiment]

          return (
            <a
              key={article.link}
              className={`featured-card ${sentimentStyle.backgroundClass}`}
              href={article.link}
              target="_blank"
              rel="noopener"
            >
              {category && (
                <span className={`featured-cat ${category.themeClass}`}>
                  {category.icon} {category.label}
                </span>
              )}
              <span className={`featured-pill ${sentimentStyle.pillClass}`}>
                {sentimentStyle.icon} {sentimentStyle.label}
              </span>
              <span className="featured-title">{article.title}</span>
              <span className="featured-meta">
                {article.sourceName && <span>{article.sourceName}</span>}
                <span>{formatTimeAgo(article.publishedAt)}</span>
              </span>
            </a>
          )
        })}
      </div>
    </section>
  )
}

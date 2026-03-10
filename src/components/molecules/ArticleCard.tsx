import { SENTIMENT_DISPLAY } from '../../config/sentimentKeywords.config'
import { formatTimeAgo } from '../../utils/timeFormatting.util'
import { getCrossCategoryTags } from '../../utils/categoryLookup.util'
import type { NewsArticle } from '../../types'

interface ArticleCardProps {
  article: NewsArticle
  hideCategoryId?: string
}

export function ArticleCard({ article, hideCategoryId }: ArticleCardProps) {
  const sentimentStyle = SENTIMENT_DISPLAY[article.sentiment]
  const crossCategories = getCrossCategoryTags(article.matchedTopics, hideCategoryId)

  const crossCategoryTags = crossCategories.map(category => (
    <span key={category.categoryId} className={`tg ${category.themeClass}`}>
      {category.icon} {category.label}
    </span>
  ))

  return (
    <a className={`card ${sentimentStyle.backgroundClass}`} href={article.link} target="_blank" rel="noopener">
      <span className={`ca ${sentimentStyle.arrowClass}`}>{sentimentStyle.icon}</span>
      <div className="cb">
        <div className="ct">
          <span className={`tg ${sentimentStyle.pillClass}`}>
            {sentimentStyle.icon} {sentimentStyle.label}
          </span>
          {crossCategoryTags}
          {article.sourceName && (
            <span className="cs" title={article.link}>
              {article.sourceName}
            </span>
          )}
          <span className="cm">{formatTimeAgo(article.publishedAt)}</span>
        </div>
        <div className="ci">{article.title}</div>
      </div>
      <span className="ce">↗</span>
    </a>
  )
}

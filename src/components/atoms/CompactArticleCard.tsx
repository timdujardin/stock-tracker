import { SENTIMENT_DISPLAY } from '../../config/sentimentKeywords.config'
import { formatTimeAgo } from '../../utils/timeFormatting.util'
import type { NewsArticle } from '../../types'

interface CompactArticleCardProps {
  article: NewsArticle
}

export function CompactArticleCard({ article }: CompactArticleCardProps) {
  const sentimentStyle = SENTIMENT_DISPLAY[article.sentiment]

  return (
    <a
      className={`compact-card ${sentimentStyle.backgroundClass}`}
      href={article.link}
      target="_blank"
      rel="noopener"
    >
      <span className={`compact-pill ${sentimentStyle.pillClass}`}>
        {sentimentStyle.icon} {sentimentStyle.label}
      </span>
      <span className="compact-title">{article.title}</span>
      <span className="compact-meta">
        {article.sourceName && <span className="compact-source">{article.sourceName}</span>}
        <span className="compact-time">{formatTimeAgo(article.publishedAt)}</span>
      </span>
    </a>
  )
}

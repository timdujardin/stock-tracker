import { useSentimentCounts, useDayGroups } from '../../hooks/articleAnalysis.hooks'
import { SentimentBar } from '../atoms/SentimentBar'
import { ArticleCard } from './ArticleCard'
import type { NewsArticle } from '../../types'

interface WeekBucketSectionProps {
  articles: NewsArticle[]
  config: {
    label: string
    wrapperClass: string
    dotClass: string
    textClass: string
    countClass: string
  }
  isCollapsed: boolean
  onToggle: () => void
}

export function WeekBucketSection({ articles, config, isCollapsed, onToggle }: WeekBucketSectionProps) {
  const { positiveCount, negativeCount, neutralCount } = useSentimentCounts(articles)
  const dayGroups = useDayGroups(articles)

  return (
    <div>
      <div className={`wh ${config.wrapperClass}`} onClick={onToggle}>
        <div className="wl">
          <div className={`wd ${config.dotClass}`} />
          <span className={`wt ${config.textClass}`}>{config.label}</span>
          <span className={`wc ${config.countClass}`}>{articles.length} artikels</span>
          {positiveCount > 0 && <span className="sp pp">↑ {positiveCount}</span>}
          {negativeCount > 0 && <span className="sp pn">↓ {negativeCount}</span>}
          {neutralCount > 0 && <span className="sp pu">→ {neutralCount}</span>}
          <SentimentBar
            positiveCount={positiveCount}
            negativeCount={negativeCount}
            neutralCount={neutralCount}
          />
        </div>
        <span className={`wa ${config.textClass}`}>{isCollapsed ? '▸' : '▾'}</span>
      </div>

      {!isCollapsed && dayGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          <div className="dv"><span className="dl">{group.dayLabel}</span></div>
          {group.articles.map((article, articleIndex) => (
            <ArticleCard key={articleIndex} article={article} />
          ))}
        </div>
      ))}
    </div>
  )
}

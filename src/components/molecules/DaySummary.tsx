import { useGeminiSummary } from '../../contexts/GeminiSummaryContext'
import { usePeriodArticles, useArticleMood } from '../../hooks/articleAnalysis.hooks'
import { ErrorDisplay } from '../atoms/ErrorDisplay'
import type { NewsArticle } from '../../types'

interface DaySummaryProps {
  articles: NewsArticle[]
  categoryId: string
  categoryName: string
  className?: string
}

export function DaySummary({ articles, categoryId, categoryName, className }: DaySummaryProps) {
  const {
    summaries, summaryErrors, isGenerating,
    isAvailable, remainingCalls,
    generateSummary, clearSummaryError,
  } = useGeminiSummary()
  const { periodArticles, periodLabel } = usePeriodArticles(articles)
  const { overallMood, moodClass, positiveArticles, negativeArticles, neutralArticles } = useArticleMood(periodArticles)

  if (!periodArticles.length) return null

  const aiSummaryText = summaries[categoryId]
  const summaryError = summaryErrors[categoryId]
  const isCurrentlyGenerating = isGenerating[categoryId]
  const hasReachedLimit = remainingCalls <= 0

  const handleGenerateClick = () => {
    generateSummary(categoryId, categoryName, periodArticles)
  }

  const handleRetryClick = () => {
    clearSummaryError(categoryId)
    generateSummary(categoryId, categoryName, periodArticles)
  }

  return (
    <div className={className || 'feed-col-sum'}>
      <div className="sum-hdr">
        📋 Samenvatting{' '}
        <span className="sum-day">
          {periodLabel} · {periodArticles.length} artikel{periodArticles.length !== 1 ? 's' : ''}
        </span>
        <span className={`sum-mood ${moodClass}`}>{overallMood}</span>
      </div>

      {summaryError ? (
        <ErrorDisplay error={summaryError} onRetry={handleRetryClick} compact />
      ) : aiSummaryText ? (
        <div className="sum-ai">{aiSummaryText}</div>
      ) : isCurrentlyGenerating ? (
        <div className="sum-loading">Samenvatting genereren…</div>
      ) : (
        <>
          <div className="sum-lines">
            {positiveArticles.length > 0 && (
              <div className="sum-ln sl-p">
                <b>↑</b>
                {positiveArticles.slice(0, 2).map(a => a.title).join('; ')}
              </div>
            )}
            {negativeArticles.length > 0 && (
              <div className="sum-ln sl-n">
                <b>↓</b>
                {negativeArticles.slice(0, 2).map(a => a.title).join('; ')}
              </div>
            )}
            {!positiveArticles.length && !negativeArticles.length && neutralArticles.length > 0 && (
              <div className="sum-ln sl-u">
                <b>→</b>
                {neutralArticles.slice(0, 2).map(a => a.title).join('; ')}
              </div>
            )}
          </div>
          {isAvailable && (
            <button
              className="sum-gen-btn"
              onClick={handleGenerateClick}
              disabled={isCurrentlyGenerating || hasReachedLimit}
              title={hasReachedLimit ? 'Daglimiet bereikt' : 'Genereer AI samenvatting'}
            >
              ✨ AI samenvatting{hasReachedLimit ? ' (limiet)' : ''}
            </button>
          )}
        </>
      )}
    </div>
  )
}

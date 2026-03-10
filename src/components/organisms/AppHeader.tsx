import { useNewsFeed } from '../../contexts/NewsFeedContext'
import { useGeminiSummary } from '../../contexts/GeminiSummaryContext'
import { ThemeToggleButton } from '../atoms/ThemeToggleButton'

export function AppHeader() {
  const { isLoading, statusText, refreshFeed } = useNewsFeed()
  const { dailyUsageCount, isAvailable } = useGeminiSummary()

  return (
    <div id="hdr">
      <div id="htop">
        <div>
          <h1>Beleggingsnieuws Tracker</h1>
          <p id="stxt">
            {statusText}
            {isAvailable && (
              <span style={{ marginInlineStart: 8, opacity: 0.6 }}>
                AI: {dailyUsageCount}/20
              </span>
            )}
          </p>
        </div>
        <div className="hdr-actions">
          <ThemeToggleButton />
          <button id="rbtn" onClick={refreshFeed} disabled={isLoading}>
            {isLoading ? '⟳' : '↻ Vernieuwen'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useNewsFeed } from '../../contexts/NewsFeedContext'
import { useGeminiSummary } from '../../contexts/GeminiSummaryContext'
import { ThemeToggleButton } from '../atoms/ThemeToggleButton'
import { getAllCategories, countArticlesForCategory } from '../../utils/categoryLookup.util'

export function AppHeader() {
  const {
    articles, isLoading, statusText,
    categoryFilter, sentimentFilter,
    setCategoryFilter, setSentimentFilter,
    refreshFeed, countBySentiment,
  } = useNewsFeed()

  const { dailyUsageCount, isAvailable } = useGeminiSummary()

  const positiveCount = countBySentiment('positive')
  const negativeCount = countBySentiment('negative')
  const neutralCount = countBySentiment('neutral')
  const categories = getAllCategories()

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

      <div className="fr">
        <button
          className={`ch${categoryFilter === 'all' ? ' on' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          Alles
        </button>
        {categories.map(category => {
          const articleCount = countArticlesForCategory(articles, category.categoryId)
          return (
            <button
              key={category.categoryId}
              className={`ch${categoryFilter === category.categoryId ? ' on' : ''}`}
              onClick={() => setCategoryFilter(category.categoryId)}
            >
              {category.icon} {category.label}{articleCount ? ` (${articleCount})` : ''}
            </button>
          )
        })}
      </div>

      <div className="fr">
        <button
          className={`ch${sentimentFilter === 'all' ? ' on' : ''}`}
          onClick={() => setSentimentFilter('all')}
        >
          Alle impact
        </button>
        <button
          className={`ch${sentimentFilter === 'positive' ? ' og' : ''}`}
          onClick={() => setSentimentFilter('positive')}
        >
          ↑ Positief ({positiveCount})
        </button>
        <button
          className={`ch${sentimentFilter === 'negative' ? ' or' : ''}`}
          onClick={() => setSentimentFilter('negative')}
        >
          ↓ Negatief ({negativeCount})
        </button>
        <button
          className={`ch${sentimentFilter === 'neutral' ? ' on' : ''}`}
          onClick={() => setSentimentFilter('neutral')}
        >
          → Neutraal ({neutralCount})
        </button>
      </div>
    </div>
  )
}

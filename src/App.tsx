import { ThemeProvider } from './contexts/ThemeContext'
import { NewsFeedProvider } from './contexts/NewsFeedContext'
import { GeminiSummaryProvider } from './contexts/GeminiSummaryContext'
import { useAutoRefresh } from './hooks/initialization.hooks'
import { useServiceWorker } from './hooks/serviceWorker.hooks'
import { AppHeader } from './components/organisms/AppHeader'
import { FeedPage } from './components/pages/FeedPage'
import './App.css'

function AppInitializer({ children }: { children: React.ReactNode }) {
  useAutoRefresh()
  useServiceWorker()
  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <NewsFeedProvider>
        <GeminiSummaryProvider>
          <AppInitializer>
            <AppHeader />
            <div id="feed">
              <FeedPage />
            </div>
          </AppInitializer>
        </GeminiSummaryProvider>
      </NewsFeedProvider>
    </ThemeProvider>
  )
}

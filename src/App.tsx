import { lazy, Suspense, type FC } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AppHeader } from './components/organisms/AppHeader';
import { BottomNav } from './components/organisms/bottom-nav/BottomNav';
import { SkeletonFeed } from './components/organisms/SkeletonFeed';
import { GeminiOutlookProvider } from './contexts/GeminiOutlookContext';
import { GeminiSummaryProvider } from './contexts/GeminiSummaryContext';
import { GeminiUsageProvider } from './contexts/GeminiUsageContext';
import { NewsFeedProvider } from './contexts/NewsFeedContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAutoRefresh } from './hooks/initialization.hooks';
import { useServiceWorker } from './hooks/serviceWorker.hooks';

import './App.css';

const FeedPage = lazy(() => import('./components/pages/FeedPage').then((m) => ({ default: m.FeedPage })));

const AppInitializer: FC<{ children: React.ReactNode }> = ({ children }) => {
  useAutoRefresh();
  useServiceWorker();
  return children;
};

/** Root application component with providers, routing, and layout */
const App: FC = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <NewsFeedProvider>
          <GeminiUsageProvider>
            <GeminiSummaryProvider>
              <GeminiOutlookProvider>
                <AppInitializer>
                  <AppHeader />
                  <div id="feed">
                    <Suspense fallback={<SkeletonFeed />}>
                      <FeedPage />
                    </Suspense>
                  </div>
                  <BottomNav />
                </AppInitializer>
              </GeminiOutlookProvider>
            </GeminiSummaryProvider>
          </GeminiUsageProvider>
        </NewsFeedProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

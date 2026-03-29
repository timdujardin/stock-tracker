import './AppHeader.css';

import type { FC } from 'react';

import { ThemeToggleButton } from '@/components/atoms/ThemeToggleButton';
import { MAX_DAILY_REQUESTS } from '@/config/app.config';
import { useGeminiSummary } from '@/contexts/GeminiSummaryContext';
import { useNewsFeed } from '@/contexts/NewsFeedContext';

/** Renders the app header with title, status text, theme toggle, and refresh button */
export const AppHeader: FC = () => {
  const { isLoading, statusText, refreshFeed } = useNewsFeed();
  const { dailyUsageCount, isAvailable } = useGeminiSummary();

  return (
    <div id="hdr">
      <div id="htop">
        <div>
          <h1>Beleggingsnieuws Tracker</h1>
          <p id="stxt">
            {statusText}
            {isAvailable ? (
              <span style={{ marginInlineStart: 8, opacity: 0.6 }}>
                AI: {dailyUsageCount}/{MAX_DAILY_REQUESTS}
              </span>
            ) : null}
          </p>
        </div>
        <div className="hdr-actions">
          <ThemeToggleButton />
          <button type="button" id="rbtn" onClick={refreshFeed} disabled={isLoading}>
            {isLoading ? '⟳' : '↻'}
          </button>
        </div>
      </div>
    </div>
  );
};

import type { FC } from 'react';

import './SentimentCounters.css';

import type { Sentiment } from '@/types';

import { sentimentCounter } from './SentimentCounters.styles';

interface SentimentCountersProps {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  activeFilter?: Sentiment | null;
  onFilterChange?: (sentiment: Sentiment | null) => void;
}

/** Renders labeled counters for each sentiment type, optionally acting as filter buttons */
export const SentimentCounters: FC<SentimentCountersProps> = ({
  positiveCount,
  negativeCount,
  neutralCount,
  activeFilter,
  onFilterChange,
}) => {
  const total = positiveCount + negativeCount + neutralCount;

  if (total === 0) {
    return null;
  }

  const handleClick = (sentiment: Sentiment) => {
    onFilterChange?.(activeFilter === sentiment ? null : sentiment);
  };

  return (
    <div className="sentiment-counters">
      <button
        type="button"
        className={sentimentCounter({ sentiment: 'positive', active: activeFilter === 'positive' || undefined })}
        onClick={() => handleClick('positive')}
      >
        <span className="sentiment-counter__icon">↑</span>
        <span className="sentiment-counter__count">{positiveCount}</span>
        <span className="sentiment-counter__label">positief</span>
      </button>
      <button
        type="button"
        className={sentimentCounter({ sentiment: 'negative', active: activeFilter === 'negative' || undefined })}
        onClick={() => handleClick('negative')}
      >
        <span className="sentiment-counter__icon">↓</span>
        <span className="sentiment-counter__count">{negativeCount}</span>
        <span className="sentiment-counter__label">negatief</span>
      </button>
      <button
        type="button"
        className={sentimentCounter({ sentiment: 'neutral', active: activeFilter === 'neutral' || undefined })}
        onClick={() => handleClick('neutral')}
      >
        <span className="sentiment-counter__icon">→</span>
        <span className="sentiment-counter__count">{neutralCount}</span>
        <span className="sentiment-counter__label">neutraal</span>
      </button>
    </div>
  );
};

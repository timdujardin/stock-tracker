import type { FC } from 'react';

import './SentimentCounters.css';

import { SkeletonPulse } from './SkeletonPulse';

/** Renders a skeleton placeholder for the SentimentCounters section */
export const SkeletonCounters: FC = () => {
  return (
    <div className="sentiment-counters">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="sentiment-counter" style={{ border: 'none' }}>
          <SkeletonPulse width="100%" height="max(0.65rem, 16px)" borderRadius="0.25rem" />
        </div>
      ))}
    </div>
  );
};

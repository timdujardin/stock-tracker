import type { FC } from 'react';

import './HighlightedArticleCard.css';

import { SkeletonPulse } from './SkeletonPulse';

/** Renders a skeleton placeholder for the HighlightedArticleCard */
export const SkeletonHighlightedCard: FC = () => {
  return (
    <div className="highlighted-card">
      <div className="highlighted-card__body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <SkeletonPulse width="5.5rem" height="max(0.6rem, 16px)" borderRadius="2rem" />
          <SkeletonPulse width="4rem" height="max(0.6rem, 16px)" borderRadius="0.25rem" />
        </div>
        <SkeletonPulse width="100%" height="max(0.9rem, 16px)" borderRadius="0.25rem" />
        <SkeletonPulse width="80%" height="max(0.9rem, 16px)" borderRadius="0.25rem" />
        <SkeletonPulse width="50%" height="max(0.9rem, 16px)" borderRadius="0.25rem" />
        <SkeletonPulse width="7rem" height="max(0.65rem, 16px)" borderRadius="0.25rem" />
      </div>
    </div>
  );
};

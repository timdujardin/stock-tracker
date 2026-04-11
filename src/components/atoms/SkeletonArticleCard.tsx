import type { FC } from 'react';

import './ArticleCard.css';

import { SkeletonPulse } from './SkeletonPulse';

/** Renders a skeleton placeholder for an ArticleCard */
export const SkeletonArticleCard: FC = () => {
  return (
    <div className="article-card">
      <div className="article-card__body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <SkeletonPulse width="5rem" height="max(0.6rem, 16px)" borderRadius="2rem" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <SkeletonPulse width="3.5rem" height="max(0.6rem, 16px)" borderRadius="0.25rem" />
          <SkeletonPulse width="5.5rem" height="max(0.6rem, 16px)" borderRadius="0.25rem" />
        </div>
        <SkeletonPulse width="100%" height="max(0.75rem, 16px)" borderRadius="0.25rem" />
        <SkeletonPulse width="70%" height="max(0.75rem, 16px)" borderRadius="0.25rem" />
        <SkeletonPulse width="6rem" height="max(0.65rem, 16px)" borderRadius="0.25rem" />
      </div>
    </div>
  );
};

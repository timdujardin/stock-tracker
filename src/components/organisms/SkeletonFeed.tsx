import './CategorySection.css';

import type { FC } from 'react';

import { SkeletonArticleCard } from '@/components/atoms/SkeletonArticleCard';
import { SkeletonCounters } from '@/components/atoms/SkeletonCounters';
import { SkeletonHighlightedCard } from '@/components/atoms/SkeletonHighlightedCard';
import { SkeletonSummary } from '@/components/atoms/SkeletonSummary';

/** Renders a full-page skeleton loading placeholder matching the vertical feed layout */
export const SkeletonFeed: FC = () => {
  return (
    <div className="cat-feed">
      <SkeletonSummary />
      <SkeletonCounters />
      <SkeletonHighlightedCard />
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonArticleCard key={i} />
      ))}
    </div>
  );
};

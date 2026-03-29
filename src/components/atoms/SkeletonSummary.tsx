import type { FC } from 'react';

import '@/components/molecules/DaySummary.css';

import { SkeletonPulse } from './SkeletonPulse';

/** Renders a skeleton placeholder for the DaySummary section */
export const SkeletonSummary: FC = () => {
  return (
    <div className="feed-col-sum">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBlockEnd: '0.4rem' }}>
        <SkeletonPulse width="10rem" height="max(0.75rem, 16px)" borderRadius="0.25rem" />
        <SkeletonPulse width="4.5rem" height="max(0.65rem, 16px)" borderRadius="2rem" />
      </div>
      <SkeletonPulse width="100%" height="max(0.7rem, 16px)" borderRadius="0.25rem" />
      <SkeletonPulse width="85%" height="max(0.7rem, 16px)" borderRadius="0.25rem" />
      <SkeletonPulse width="12rem" height="max(0.65rem, 16px)" borderRadius="2rem" />
    </div>
  );
};

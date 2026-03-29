import type { FC } from 'react';

interface SkeletonPulseProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

/** Renders an animated placeholder pulse for loading states */
export const SkeletonPulse: FC<SkeletonPulseProps> = ({
  width = '100%',
  height = '0.75rem',
  borderRadius = '0.375rem',
  className = '',
}) => {
  return (
    <div className={`skeleton-pulse ${className}`} style={{ inlineSize: width, blockSize: height, borderRadius }} />
  );
};

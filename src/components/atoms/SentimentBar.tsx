import type { FC } from 'react';

interface SentimentBarProps {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  className?: string;
}

/** Renders a proportional color bar visualizing sentiment distribution */
export const SentimentBar: FC<SentimentBarProps> = ({ positiveCount, negativeCount, neutralCount, className }) => {
  return (
    <div className={className || 'sentiment-bar'}>
      <span className="sb-p" style={{ flex: positiveCount }} />
      <span className="sb-n" style={{ flex: negativeCount }} />
      <span className="sb-u" style={{ flex: neutralCount }} />
    </div>
  );
};

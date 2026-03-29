import './DaySummary.css';

import type { FC } from 'react';

interface SummaryResultProps {
  aiSummaryText: string;
  summaryLabel: string;
  isAvailable: boolean;
  hasReachedLimit: boolean;
  isCurrentlyGenerating: boolean;
  onGenerate: () => void;
}

/** Renders the AI-generated summary text with an optional regenerate button */
export const SummaryResult: FC<SummaryResultProps> = ({
  aiSummaryText,
  summaryLabel,
  isAvailable,
  hasReachedLimit,
  isCurrentlyGenerating,
  onGenerate,
}) => {
  return (
    <>
      <div className="sum-ai">{aiSummaryText}</div>
      {isAvailable && !hasReachedLimit ? (
        <button type="button" className="sum-gen-btn" onClick={onGenerate} disabled={isCurrentlyGenerating}>
          {isCurrentlyGenerating ? '⟳ Genereren…' : `↻ ${summaryLabel}`}
        </button>
      ) : null}
    </>
  );
};

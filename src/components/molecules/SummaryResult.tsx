import './DaySummary.css';

import type { FC } from 'react';

import type { CategorySummary, InvestmentRecommendation } from '@/types';

export const RECOMMENDATION_DISPLAY: Record<InvestmentRecommendation, { label: string; cssClass: string }> = {
  STRONG_BUY: { label: 'Strong Buy', cssClass: 'sum-rec-sb' },
  BUY: { label: 'Buy', cssClass: 'sum-rec-b' },
  HOLD: { label: 'Hold', cssClass: 'sum-rec-h' },
  SELL: { label: 'Sell', cssClass: 'sum-rec-s' },
  STRONG_SELL: { label: 'Strong Sell', cssClass: 'sum-rec-ss' },
};

interface SummaryResultProps {
  summary: CategorySummary;
  summaryLabel: string;
  isAvailable: boolean;
  hasReachedLimit: boolean;
  isCurrentlyGenerating: boolean;
  onGenerate: () => void;
}

/** Renders the AI-generated summary with investment recommendation badge and regenerate button */
export const SummaryResult: FC<SummaryResultProps> = ({
  summary,
  summaryLabel,
  isAvailable,
  hasReachedLimit,
  isCurrentlyGenerating,
  onGenerate,
}) => {
  return (
    <>
      <div className="sum-ai">{summary.text}</div>
      {summary.reasoning ? <div className="sum-reasoning">{summary.reasoning}</div> : null}
      {isAvailable && !hasReachedLimit ? (
        <button type="button" className="sum-gen-btn" onClick={onGenerate} disabled={isCurrentlyGenerating}>
          {isCurrentlyGenerating ? '⟳ Genereren…' : `↻ ${summaryLabel}`}
        </button>
      ) : null}
    </>
  );
};

import './DaySummary.css';

import type { FC } from 'react';

import { HEADLINE_PREVIEW_LIMIT } from '@/config/app.config';
import type { NewsArticle } from '@/types';
import { getHeadlineSummary } from '@/utils/articleSorting.util';

interface SummaryPreviewProps {
  positiveArticles: NewsArticle[];
  negativeArticles: NewsArticle[];
  neutralArticles: NewsArticle[];
  summaryLabel: string;
  isAvailable: boolean;
  hasReachedLimit: boolean;
  isCurrentlyGenerating: boolean;
  onGenerate: () => void;
}

/** Renders headline previews grouped by sentiment with an optional generate button */
export const SummaryPreview: FC<SummaryPreviewProps> = ({
  positiveArticles,
  negativeArticles,
  neutralArticles,
  summaryLabel,
  isAvailable,
  hasReachedLimit,
  isCurrentlyGenerating,
  onGenerate,
}) => {
  const buttonLabel = hasReachedLimit ? `✨ ${summaryLabel} (limiet)` : `✨ ${summaryLabel}`;

  return (
    <>
      <div className="sum-lines">
        {positiveArticles.length > 0 && (
          <div className="sum-ln sl-p">
            <b>↑</b>
            {getHeadlineSummary(positiveArticles, HEADLINE_PREVIEW_LIMIT)}
          </div>
        )}
        {negativeArticles.length > 0 && (
          <div className="sum-ln sl-n">
            <b>↓</b>
            {getHeadlineSummary(negativeArticles, HEADLINE_PREVIEW_LIMIT)}
          </div>
        )}
        {!positiveArticles.length && !negativeArticles.length && neutralArticles.length > 0 && (
          <div className="sum-ln sl-u">
            <b>→</b>
            {getHeadlineSummary(neutralArticles, HEADLINE_PREVIEW_LIMIT)}
          </div>
        )}
      </div>
      {isAvailable ? (
        <button
          type="button"
          className="sum-gen-btn"
          onClick={onGenerate}
          disabled={isCurrentlyGenerating || hasReachedLimit}
          title={hasReachedLimit ? 'Daglimiet bereikt' : summaryLabel}
        >
          {buttonLabel}
        </button>
      ) : null}
    </>
  );
};

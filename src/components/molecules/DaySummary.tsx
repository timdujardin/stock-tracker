import './DaySummary.css';

import type { FC } from 'react';

import { ErrorDisplay } from '@/components/atoms/ErrorDisplay';
import { useGeminiSummary } from '@/contexts/GeminiSummaryContext';
import { useArticleMood, usePeriodArticles } from '@/hooks/articleAnalysis.hooks';
import type { NewsArticle } from '@/types';

import { summaryMood } from './DaySummary.styles';
import { SummaryPreview } from './SummaryPreview';
import { SummaryResult } from './SummaryResult';

interface DaySummaryProps {
  articles: NewsArticle[];
  categoryId: string;
  categoryName: string;
  className?: string;
}

/** Renders a daily summary with sentiment mood, headline previews, and optional AI summary */
export const DaySummary: FC<DaySummaryProps> = ({ articles, categoryId, categoryName, className }) => {
  const { summaries, summaryErrors, isGenerating, isAvailable, remainingCalls, generateSummary, clearSummaryError } =
    useGeminiSummary();
  const { periodArticles, periodLabel } = usePeriodArticles(articles);
  const { overallMood, moodKey, positiveArticles, negativeArticles, neutralArticles } = useArticleMood(periodArticles);

  if (!periodArticles.length) {
    return null;
  }

  const aiSummaryText = summaries[categoryId];
  const summaryError = summaryErrors[categoryId];
  const isCurrentlyGenerating = isGenerating[categoryId];
  const hasReachedLimit = remainingCalls <= 0;
  const summaryLabel = `AI samenvatting ${periodLabel}`;

  const handleGenerateClick = () => {
    generateSummary(categoryId, categoryName, periodArticles);
  };

  const handleRetryClick = () => {
    clearSummaryError(categoryId);
    generateSummary(categoryId, categoryName, periodArticles);
  };

  return (
    <div className={className || 'feed-col-sum'}>
      <div className="sum-hdr">
        📋 Samenvatting
        <span className={summaryMood({ mood: moodKey })}>{overallMood}</span>
      </div>

      {summaryError ? <ErrorDisplay error={summaryError} onRetry={handleRetryClick} compact /> : null}

      {!summaryError && aiSummaryText ? (
        <SummaryResult
          aiSummaryText={aiSummaryText}
          summaryLabel={summaryLabel}
          isAvailable={isAvailable}
          hasReachedLimit={hasReachedLimit}
          isCurrentlyGenerating={isCurrentlyGenerating}
          onGenerate={handleGenerateClick}
        />
      ) : null}

      {!summaryError && !aiSummaryText && isCurrentlyGenerating ? (
        <div className="sum-loading">Samenvatting genereren…</div>
      ) : null}

      {!summaryError && !aiSummaryText && !isCurrentlyGenerating ? (
        <SummaryPreview
          positiveArticles={positiveArticles}
          negativeArticles={negativeArticles}
          neutralArticles={neutralArticles}
          summaryLabel={summaryLabel}
          isAvailable={isAvailable}
          hasReachedLimit={hasReachedLimit}
          isCurrentlyGenerating={isCurrentlyGenerating}
          onGenerate={handleGenerateClick}
        />
      ) : null}
    </div>
  );
};

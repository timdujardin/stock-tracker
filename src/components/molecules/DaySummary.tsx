import './DaySummary.css';

import type { FC } from 'react';

import { ErrorDisplay } from '@/components/atoms/ErrorDisplay';
import { useGeminiSummary } from '@/contexts/GeminiSummaryContext';
import { useGeminiUsage } from '@/contexts/GeminiUsageContext';
import { useArticleMood, usePeriodArticles } from '@/hooks/articleAnalysis.hooks';
import type { NewsArticle } from '@/types';

import { summaryMood } from './DaySummary.styles';
import { SummaryPreview } from './SummaryPreview';
import { RECOMMENDATION_DISPLAY, SummaryResult } from './SummaryResult';

interface DaySummaryProps {
  articles: NewsArticle[];
  categoryId: string;
  categoryName: string;
  articleCount?: number;
  className?: string;
}

/** Renders a daily summary with sentiment mood, headline previews, and optional AI summary */
export const DaySummary: FC<DaySummaryProps> = ({ articles, categoryId, categoryName, articleCount, className }) => {
  const { summaries, summaryErrors, isGenerating, generateSummary, clearSummaryError } = useGeminiSummary();
  const { isAvailable, remainingCalls } = useGeminiUsage();
  const { periodArticles, periodLabel } = usePeriodArticles(articles);
  const { overallMood, moodKey, positiveArticles, negativeArticles, neutralArticles } = useArticleMood(periodArticles);

  if (!periodArticles.length) {
    return null;
  }

  const aiSummary = summaries[categoryId];
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
        📋 Samenvatting{articleCount != null ? ` van ${articleCount} artikels` : ''}
        <span className={summaryMood({ mood: moodKey })}>{overallMood}</span>
        {aiSummary ? (
          <span className={`sum-rec ${RECOMMENDATION_DISPLAY[aiSummary.recommendation].cssClass}`}>
            {RECOMMENDATION_DISPLAY[aiSummary.recommendation].label}
          </span>
        ) : null}
      </div>

      {summaryError ? <ErrorDisplay error={summaryError} onRetry={handleRetryClick} compact /> : null}

      {!summaryError && aiSummary ? (
        <SummaryResult
          summary={aiSummary}
          summaryLabel={summaryLabel}
          isAvailable={isAvailable}
          hasReachedLimit={hasReachedLimit}
          isCurrentlyGenerating={isCurrentlyGenerating}
          onGenerate={handleGenerateClick}
        />
      ) : null}

      {!summaryError && !aiSummary && isCurrentlyGenerating ? (
        <div className="sum-loading">Samenvatting genereren…</div>
      ) : null}

      {!summaryError && !aiSummary && !isCurrentlyGenerating ? (
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

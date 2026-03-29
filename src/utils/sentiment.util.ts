import { SENTIMENT_KEYWORDS } from '@/config/sentimentKeywords.config';
import type { Sentiment } from '@/types';

/**
 * Analyzes keyword-based sentiment of an article title for a given category.
 * @param title - The article title to analyze
 * @param categoryId - The category whose sentiment keywords to use
 * @returns The detected sentiment: positive, negative, or neutral
 */
export const analyzeSentiment = (title: string, categoryId: string): Sentiment => {
  const keywords = SENTIMENT_KEYWORDS[categoryId];
  if (!keywords) {
    return 'neutral';
  }

  const lowercaseTitle = title.toLowerCase();
  let positiveMatches = 0;
  let negativeMatches = 0;

  keywords.positive.forEach((keyword) => {
    if (lowercaseTitle.includes(keyword)) {
      positiveMatches++;
    }
  });
  keywords.negative.forEach((keyword) => {
    if (lowercaseTitle.includes(keyword)) {
      negativeMatches++;
    }
  });

  if (positiveMatches > negativeMatches) {
    return 'positive';
  }
  if (negativeMatches > positiveMatches) {
    return 'negative';
  }

  return 'neutral';
};

import { useMemo } from 'react';

import { MS_PER_DAY } from '@/config/app.config';
import type { NewsArticle } from '@/types';
import { getStartOfToday } from '@/utils/timeFormatting.util';

interface SentimentCounts {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

/** Counts articles by sentiment category (positive, negative, neutral). */
/** @param articles - Array of news articles to analyze. */
/** @returns Memoized sentiment count breakdown. */
export const useSentimentCounts = (articles: NewsArticle[]): SentimentCounts => {
  return useMemo(
    () => ({
      positiveCount: articles.filter((a) => a.sentiment === 'positive').length,
      negativeCount: articles.filter((a) => a.sentiment === 'negative').length,
      neutralCount: articles.filter((a) => a.sentiment === 'neutral').length,
    }),
    [articles],
  );
};

interface PeriodArticles {
  periodArticles: NewsArticle[];
  periodLabel: string;
}

/** Returns articles for the most recent period: today, yesterday, or all articles from the most recent date. */
/** @param articles - Sorted array of news articles (newest first). */
/** @returns Memoized period articles and a label indicating the time period. */
export const usePeriodArticles = (articles: NewsArticle[]): PeriodArticles => {
  return useMemo(() => {
    const todayStart = getStartOfToday();
    const yesterdayStart = todayStart - MS_PER_DAY;

    const todayArticles = articles.filter((a) => a.publishedAt >= todayStart);
    if (todayArticles.length) {
      return { periodArticles: todayArticles, periodLabel: 'vandaag' };
    }

    const yesterdayArticles = articles.filter((a) => a.publishedAt >= yesterdayStart && a.publishedAt < todayStart);
    if (yesterdayArticles.length) {
      return { periodArticles: yesterdayArticles, periodLabel: 'gisteren' };
    }

    if (!articles.length) {
      return { periodArticles: [], periodLabel: 'vandaag' };
    }

    const mostRecentDate = new Date(articles[0].publishedAt);
    const dayStart = new Date(
      mostRecentDate.getFullYear(),
      mostRecentDate.getMonth(),
      mostRecentDate.getDate(),
    ).getTime();
    const dayEnd = dayStart + MS_PER_DAY;

    const sameDayArticles = articles.filter((a) => a.publishedAt >= dayStart && a.publishedAt < dayEnd);
    const label = mostRecentDate.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long' });

    return { periodArticles: sameDayArticles, periodLabel: label };
  }, [articles]);
};

type MoodKey = 'positive' | 'negative' | 'neutral' | 'mixed';

interface ArticleMood {
  overallMood: string;
  moodKey: MoodKey;
  positiveArticles: NewsArticle[];
  negativeArticles: NewsArticle[];
  neutralArticles: NewsArticle[];
}

/** Derives the overall mood and sentiment-grouped articles from a list. */
/** @param articles - Array of news articles to classify. */
/** @returns Memoized mood label, mood key, and articles split by sentiment. */
export const useArticleMood = (articles: NewsArticle[]): ArticleMood => {
  return useMemo(() => {
    const positiveArticles = articles.filter((a) => a.sentiment === 'positive');
    const negativeArticles = articles.filter((a) => a.sentiment === 'negative');
    const neutralArticles = articles.filter((a) => a.sentiment === 'neutral');

    let overallMood: string;
    let moodKey: MoodKey;

    if (positiveArticles.length > negativeArticles.length && positiveArticles.length >= neutralArticles.length) {
      overallMood = 'Positief';
      moodKey = 'positive';
    } else if (negativeArticles.length > positiveArticles.length && negativeArticles.length >= neutralArticles.length) {
      overallMood = 'Negatief';
      moodKey = 'negative';
    } else if (positiveArticles.length > 0 && negativeArticles.length > 0) {
      overallMood = 'Gemengd';
      moodKey = 'mixed';
    } else {
      overallMood = 'Neutraal';
      moodKey = 'neutral';
    }

    return { overallMood, moodKey, positiveArticles, negativeArticles, neutralArticles };
  }, [articles]);
};

import './CategorySection.css';

import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { SentimentCounters } from '@/components/atoms/SentimentCounters';
import { ArticleList } from '@/components/molecules/ArticleList';
import { DaySummary } from '@/components/molecules/DaySummary';
import { SentimentTrendChart } from '@/components/molecules/SentimentTrendChart';
import { CATEGORY_ARTICLE_LIMIT } from '@/config/app.config';
import { useNewsFeed } from '@/contexts/NewsFeedContext';
import { useSentimentCounts } from '@/hooks/articleAnalysis.hooks';
import type { NewsCategory, Sentiment } from '@/types';
import { getSortedRecentArticles } from '@/utils/articleSorting.util';

interface CategorySectionProps {
  category: NewsCategory;
}

/** Renders a full category feed: AI summary, sentiment counters, highlighted article, remaining articles */
export const CategorySection: FC<CategorySectionProps> = ({ category }) => {
  const { getArticlesForCategory } = useNewsFeed();
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment | null>(null);

  const allArticles = getArticlesForCategory(category.categoryId);
  const sortedArticles = getSortedRecentArticles(allArticles, CATEGORY_ARTICLE_LIMIT);

  const { positiveCount, negativeCount, neutralCount } = useSentimentCounts(sortedArticles);

  const filteredArticles = useMemo(
    () => (sentimentFilter ? sortedArticles.filter((a) => a.sentiment === sentimentFilter) : sortedArticles),
    [sortedArticles, sentimentFilter],
  );

  if (!sortedArticles.length) {
    return null;
  }

  return (
    <section className="cat-feed">
      <DaySummary articles={sortedArticles} categoryId={category.categoryId} categoryName={category.label} />

      <SentimentCounters
        positiveCount={positiveCount}
        negativeCount={negativeCount}
        neutralCount={neutralCount}
        activeFilter={sentimentFilter}
        onFilterChange={setSentimentFilter}
      />

      <SentimentTrendChart articles={sortedArticles} />

      <ArticleList articles={filteredArticles} />
    </section>
  );
};

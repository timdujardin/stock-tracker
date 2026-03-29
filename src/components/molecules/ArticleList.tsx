import './ArticleList.css';

import type { FC } from 'react';

import { ArticleCard } from '@/components/atoms/ArticleCard';
import { HighlightedArticleCard } from '@/components/atoms/HighlightedArticleCard';
import { SLIDER_PAGE_SIZE } from '@/config/app.config';
import { usePagination } from '@/hooks/pagination.hooks';
import type { NewsArticle } from '@/types';

interface ArticleListProps {
  articles: NewsArticle[];
}

/** Renders a vertical article feed: highlighted first item + paginated remaining cards */
export const ArticleList: FC<ArticleListProps> = ({ articles }) => {
  const [highlighted, ...rest] = articles;
  const { displayedItems, hasMore, remainingCount, showMore } = usePagination(rest, SLIDER_PAGE_SIZE);

  if (!highlighted) {
    return null;
  }

  return (
    <div className="article-list">
      <HighlightedArticleCard article={highlighted} />
      {displayedItems.map((article, index) => (
        <ArticleCard key={index} article={article} />
      ))}
      {hasMore ? (
        <button type="button" className="article-list__more" onClick={showMore}>
          +{remainingCount} meer
        </button>
      ) : null}
    </div>
  );
};

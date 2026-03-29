import type { NewsArticle } from '@/types';

/**
 * Returns the most recent articles sorted by publish date.
 * @param articles - The articles to sort
 * @param limit - Maximum number of articles to return
 * @returns Sorted articles, most recent first
 */
export const getSortedRecentArticles = (articles: NewsArticle[], limit: number): NewsArticle[] => {
  return [...articles].sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0)).slice(0, limit);
};

/**
 * Joins the first N article titles into a semicolon-separated summary string.
 * @param articles - The articles to summarize
 * @param limit - Maximum number of titles to include
 * @returns Concatenated headline summary
 */
export const getHeadlineSummary = (articles: NewsArticle[], limit: number): string => {
  return articles
    .slice(0, limit)
    .map((a) => a.title)
    .join('; ');
};

/**
 * Filters articles to only those belonging to a specific category.
 * @param articles - The articles to filter
 * @param categoryId - The category ID to match
 * @returns Articles matching the given category
 */
export const filterArticlesByCategory = (articles: NewsArticle[], categoryId: string): NewsArticle[] => {
  return articles.filter((article) => article.categoryId === categoryId);
};

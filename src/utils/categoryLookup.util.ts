import { CATEGORY_IDS, FEED_SOURCES } from '@/config/feedSources.config';
import type { NewsCategory } from '@/types';

const categoryIndex = new Map<string, NewsCategory>(FEED_SOURCES.map((source) => [source.categoryId, source]));

/**
 * Retrieves a category configuration by its unique identifier.
 * @param categoryId - The category to look up
 * @returns The matching category or undefined if not found
 */
export const getCategoryById = (categoryId: string): NewsCategory | undefined => {
  return categoryIndex.get(categoryId);
};

/**
 * Returns all categories in their configured display order.
 * @returns Array of all registered news categories
 */
export const getAllCategories = (): NewsCategory[] => {
  return CATEGORY_IDS.map((id) => categoryIndex.get(id)).filter(Boolean) as NewsCategory[];
};

import { FEED_SOURCES, CATEGORY_IDS } from '../config/feedSources.config'
import type { NewsCategory, NewsArticle } from '../types'

const categoryIndex = new Map<string, NewsCategory>(
  FEED_SOURCES.map(source => [source.categoryId, source])
)

export function getCategoryById(categoryId: string): NewsCategory | undefined {
  return categoryIndex.get(categoryId)
}

export function getAllCategories(): NewsCategory[] {
  return CATEGORY_IDS.map(id => categoryIndex.get(id)).filter(Boolean) as NewsCategory[]
}

export function getSelectedCategory(categoryFilter: string): NewsCategory | null {
  if (categoryFilter === 'all' || !CATEGORY_IDS.includes(categoryFilter)) return null
  return categoryIndex.get(categoryFilter) ?? null
}

export function getCrossCategoryTags(matchedTopics: string[], excludeCategoryId?: string): NewsCategory[] {
  return matchedTopics
    .filter(topicId => CATEGORY_IDS.includes(topicId) && topicId !== excludeCategoryId)
    .map(topicId => categoryIndex.get(topicId))
    .filter(Boolean) as NewsCategory[]
}

export function countArticlesForCategory(articles: NewsArticle[], categoryId: string): number {
  return articles.filter(
    article => article.categoryId === categoryId || article.matchedTopics.includes(categoryId)
  ).length
}

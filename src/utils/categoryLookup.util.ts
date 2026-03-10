import { FEED_SOURCES, CATEGORY_IDS } from '../config/feedSources.config'
import type { NewsCategory } from '../types'

const categoryIndex = new Map<string, NewsCategory>(
  FEED_SOURCES.map(source => [source.categoryId, source])
)

export function getCategoryById(categoryId: string): NewsCategory | undefined {
  return categoryIndex.get(categoryId)
}

export function getAllCategories(): NewsCategory[] {
  return CATEGORY_IDS.map(id => categoryIndex.get(id)).filter(Boolean) as NewsCategory[]
}

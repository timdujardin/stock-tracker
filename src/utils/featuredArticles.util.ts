import type { NewsArticle } from '../types'

const FEATURED_CATEGORY_IDS = ['to', 'ct', 'iv']

export function getFeaturedArticles(articles: NewsArticle[]): NewsArticle[] {
  return FEATURED_CATEGORY_IDS
    .map(categoryId => {
      const categoryArticles = articles.filter(
        a => a.categoryId === categoryId || a.matchedTopics.includes(categoryId)
      )

      const nonNeutral = categoryArticles
        .filter(a => a.sentiment !== 'neutral')
        .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))

      return nonNeutral[0] ?? categoryArticles.sort(
        (a, b) => (b.publishedAt || 0) - (a.publishedAt || 0)
      )[0] ?? null
    })
    .filter(Boolean) as NewsArticle[]
}

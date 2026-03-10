export type Sentiment = 'positive' | 'negative' | 'neutral'

export interface NewsCategory {
  categoryId: string
  label: string
  icon: string
  themeClass: string
  rssFeeds: string[]
}

export interface NewsArticle {
  title: string
  link: string
  publishedAt: number
  sourceName: string
  categoryId: string
  categoryLabel: string
  categoryIcon: string
  categoryThemeClass: string
  sentiment: Sentiment
  matchedTopics: string[]
}

export interface SentimentDisplay {
  backgroundClass: string
  arrowClass: string
  pillClass: string
  icon: string
  label: string
}

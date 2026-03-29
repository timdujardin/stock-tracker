/** Sentiment classification for a news article. */
export type Sentiment = 'positive' | 'negative' | 'neutral';

/** RSS news category with feed sources and display metadata. */
export interface NewsCategory {
  categoryId: string;
  label: string;
  icon: string;
  themeClass: string;
  rssFeeds: string[];
}

/** Parsed news article with source, category, and sentiment data. */
export interface NewsArticle {
  title: string;
  link: string;
  publishedAt: number;
  sourceName: string;
  categoryId: string;
  categoryLabel: string;
  categoryIcon: string;
  categoryThemeClass: string;
  sentiment: Sentiment;
  matchedTopics: string[];
}

/** CSS classes and display properties for rendering a sentiment indicator. */
export interface SentimentDisplay {
  backgroundClass: string;
  arrowClass: string;
  pillClass: string;
  icon: string;
  label: string;
}

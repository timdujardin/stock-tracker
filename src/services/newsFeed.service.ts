import { DEDUP_KEY_LENGTH } from '@/config/app.config';
import { EXCLUDED_TITLE_TERMS } from '@/config/excludedTerms.config';
import { FEED_SOURCES, RSS_PROXY_URL } from '@/config/feedSources.config';
import type { NewsArticle, NewsCategory } from '@/types';
import { createNetworkError, createNotFoundError, type AppError } from '@/types/errors';
import { analyzeSentiment } from '@/utils/sentiment.util';
import { extractArticleSource } from '@/utils/sourceExtraction.util';
import { stripHtmlTags } from '@/utils/textCleaning.util';
import { parsePublishedDate } from '@/utils/timeFormatting.util';
import { detectMatchingTopics } from '@/utils/topicDetection.util';

interface RssEntry {
  title?: string;
  link?: string;
  pubDate?: string;
  author?: string;
}

interface FeedResponse {
  status?: string;
  items?: RssEntry[];
}

/** Aggregated result of fetching all RSS feeds, including articles and error state. */
export interface FeedResult {
  articles: NewsArticle[];
  failedFeeds: number;
  totalFeeds: number;
  error: AppError | null;
}

/** Returns the total number of individual RSS feeds across all configured sources. */
export const getTotalFeedCount = (): number => {
  return FEED_SOURCES.reduce((total, source) => total + source.rssFeeds.length, 0);
};

/**
 * Fetches, deduplicates, and sorts news articles from all configured RSS feeds.
 * @param onProgress - Optional callback invoked after each feed completes.
 * @returns A FeedResult with deduplicated articles sorted by publish date.
 */
export const fetchAllNewsArticles = async (
  onProgress?: (completed: number, total: number) => void,
): Promise<FeedResult> => {
  const collectedArticles: NewsArticle[] = [];
  let completedFeeds = 0;
  let failedFeeds = 0;
  const totalFeeds = getTotalFeedCount();

  const feedPromises = FEED_SOURCES.flatMap((source) =>
    source.rssFeeds.map((feedUrl) =>
      fetchSingleFeed(feedUrl, source, collectedArticles)
        .catch(() => {
          failedFeeds++;
        })
        .finally(() => {
          completedFeeds++;
          onProgress?.(completedFeeds, totalFeeds);
        }),
    ),
  );

  const results = await Promise.allSettled(feedPromises);

  const articles = deduplicateAndSort(collectedArticles);

  const allFailed = results.every((r) => r.status === 'rejected') || failedFeeds === totalFeeds;
  if (allFailed && articles.length === 0) {
    return {
      articles: [],
      failedFeeds,
      totalFeeds,
      error: createNetworkError('Alle nieuwsbronnen zijn onbereikbaar. Controleer je internetverbinding.'),
    };
  }

  if (articles.length === 0) {
    return {
      articles: [],
      failedFeeds,
      totalFeeds,
      error: createNotFoundError('Geen nieuwsartikelen gevonden. Probeer het later opnieuw.'),
    };
  }

  return { articles, failedFeeds, totalFeeds, error: null };
};

const fetchSingleFeed = async (
  feedUrl: string,
  source: NewsCategory,
  collectedArticles: NewsArticle[],
): Promise<void> => {
  const apiKey = import.meta.env.VITE_RSS2JSON_KEY as string | undefined;
  const apiKeyParam = apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : '';
  const response = await fetch(RSS_PROXY_URL + encodeURIComponent(feedUrl) + apiKeyParam);
  if (!response.ok) {
    throw createNetworkError(`HTTP ${response.status}`, feedUrl);
  }

  const data = (await response.json()) as FeedResponse;
  const entries = data?.items ?? [];

  for (const entry of entries) {
    const rawTitle = stripHtmlTags(entry.title || '');
    if (!rawTitle) {
      continue;
    }

    const articleLink = entry.link || '#';

    const excluded = EXCLUDED_TITLE_TERMS[source.categoryId] ?? [];
    if (excluded.some((term) => rawTitle.toLowerCase().includes(term) || articleLink.toLowerCase().includes(term))) {
      continue;
    }

    const extracted = extractArticleSource(rawTitle, articleLink);

    let matchedTopics = detectMatchingTopics(rawTitle);
    if (articleLink.includes('naturalgasintel.com')) {
      matchedTopics = ['to', ...matchedTopics].filter((value, index, array) => array.indexOf(value) === index);
    }

    collectedArticles.push({
      title: extracted.title,
      link: articleLink,
      publishedAt: parsePublishedDate(entry.pubDate || ''),
      sourceName: extracted.sourceName || stripHtmlTags(entry.author || ''),
      categoryId: source.categoryId,
      categoryLabel: source.label,
      categoryIcon: source.icon,
      categoryThemeClass: source.themeClass,
      sentiment: analyzeSentiment(rawTitle, source.categoryId),
      matchedTopics,
    });
  }
};

const deduplicateAndSort = (articles: NewsArticle[]): NewsArticle[] => {
  const seenTitles = new Set<string>();
  const uniqueArticles = articles.filter((article) => {
    const titleKey = article.title.substring(0, DEDUP_KEY_LENGTH).toLowerCase();
    if (!article.title || seenTitles.has(titleKey)) {
      return false;
    }
    seenTitles.add(titleKey);
    return true;
  });

  uniqueArticles.sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) {
      return 0;
    }
    if (!a.publishedAt) {
      return 1;
    }
    if (!b.publishedAt) {
      return -1;
    }

    return b.publishedAt - a.publishedAt;
  });

  return uniqueArticles;
};

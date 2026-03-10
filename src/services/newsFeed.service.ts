import { FEEDRAPP_PROXY_URL, FEED_SOURCES } from '../config/feedSources.config'
import { stripHtmlTags } from '../utils/textCleaning.util'
import { extractArticleSource } from '../utils/sourceExtraction.util'
import { analyzeSentiment } from '../utils/sentiment.util'
import { detectMatchingTopics } from '../utils/topicDetection.util'
import { parsePublishedDate } from '../utils/timeFormatting.util'
import { createNetworkError, createNotFoundError, type AppError } from '../types/errors'
import type { NewsArticle } from '../types'

interface RssEntry {
  title?: string
  link?: string
  publishedDate?: string
  source?: string
  author?: string
}

interface FeedResponse {
  responseData?: {
    feed?: {
      entries?: RssEntry[]
    }
  }
}

export interface FeedResult {
  articles: NewsArticle[]
  failedFeeds: number
  totalFeeds: number
  error: AppError | null
}

export function getTotalFeedCount(): number {
  return FEED_SOURCES.reduce((total, source) => total + source.rssFeeds.length, 0)
}

export async function fetchAllNewsArticles(
  onProgress?: (completed: number, total: number) => void
): Promise<FeedResult> {
  const collectedArticles: NewsArticle[] = []
  let completedFeeds = 0
  let failedFeeds = 0
  const totalFeeds = getTotalFeedCount()

  const results = await Promise.allSettled(
    FEED_SOURCES.flatMap(source =>
      source.rssFeeds.map(feedUrl =>
        fetch(FEEDRAPP_PROXY_URL + encodeURIComponent(feedUrl))
          .then(response => {
            if (!response.ok) throw createNetworkError(`HTTP ${response.status}`, feedUrl)
            return response.json()
          })
          .then((data: FeedResponse) => {
            const entries = data?.responseData?.feed?.entries || []
            entries.forEach(entry => {
              const rawTitle = stripHtmlTags(entry.title || '')
              if (!rawTitle) return

              const articleLink = entry.link || '#'
              const extracted = extractArticleSource(rawTitle, articleLink)

              let matchedTopics = detectMatchingTopics(rawTitle)
              if (articleLink.includes('naturalgasintel.com')) {
                matchedTopics = ['to', ...matchedTopics].filter(
                  (value, index, array) => array.indexOf(value) === index
                )
              }

              collectedArticles.push({
                title: extracted.title,
                link: articleLink,
                publishedAt: parsePublishedDate(entry.publishedDate || ''),
                sourceName: extracted.sourceName || stripHtmlTags(entry.source || entry.author || ''),
                categoryId: source.categoryId,
                categoryLabel: source.label,
                categoryIcon: source.icon,
                categoryThemeClass: source.themeClass,
                sentiment: analyzeSentiment(rawTitle, source.categoryId),
                matchedTopics,
              })
            })
          })
          .catch(() => { failedFeeds++ })
          .finally(() => {
            completedFeeds++
            onProgress?.(completedFeeds, totalFeeds)
          })
      )
    )
  )

  const articles = deduplicateAndSort(collectedArticles)

  const allFailed = results.every(r => r.status === 'rejected') || failedFeeds === totalFeeds
  if (allFailed && articles.length === 0) {
    return {
      articles: [],
      failedFeeds,
      totalFeeds,
      error: createNetworkError('Alle nieuwsbronnen zijn onbereikbaar. Controleer je internetverbinding.'),
    }
  }

  if (articles.length === 0) {
    return {
      articles: [],
      failedFeeds,
      totalFeeds,
      error: createNotFoundError('Geen nieuwsartikelen gevonden. Probeer het later opnieuw.'),
    }
  }

  return { articles, failedFeeds, totalFeeds, error: null }
}

function deduplicateAndSort(articles: NewsArticle[]): NewsArticle[] {
  const seenTitles = new Set<string>()
  const uniqueArticles = articles.filter(article => {
    const titleKey = article.title.substring(0, 80).toLowerCase()
    if (!article.title || seenTitles.has(titleKey)) return false
    seenTitles.add(titleKey)
    return true
  })

  uniqueArticles.sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0
    if (!a.publishedAt) return 1
    if (!b.publishedAt) return -1
    return b.publishedAt - a.publishedAt
  })

  return uniqueArticles
}

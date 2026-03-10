import { useMemo } from 'react'
import { getStartOfToday } from '../utils/timeFormatting.util'
import type { NewsArticle } from '../types'

interface SentimentCounts {
  positiveCount: number
  negativeCount: number
  neutralCount: number
}

export function useSentimentCounts(articles: NewsArticle[]): SentimentCounts {
  return useMemo(() => ({
    positiveCount: articles.filter(a => a.sentiment === 'positive').length,
    negativeCount: articles.filter(a => a.sentiment === 'negative').length,
    neutralCount: articles.filter(a => a.sentiment === 'neutral').length,
  }), [articles])
}

interface PeriodArticles {
  periodArticles: NewsArticle[]
  periodLabel: string
}

export function usePeriodArticles(articles: NewsArticle[]): PeriodArticles {
  return useMemo(() => {
    const todayStart = getStartOfToday()
    const yesterdayStart = todayStart - 86400000

    const todayArticles = articles.filter(a => a.publishedAt >= todayStart)
    if (todayArticles.length) {
      return { periodArticles: todayArticles, periodLabel: 'Vandaag' }
    }

    const yesterdayArticles = articles.filter(
      a => a.publishedAt >= yesterdayStart && a.publishedAt < todayStart
    )
    if (yesterdayArticles.length) {
      return { periodArticles: yesterdayArticles, periodLabel: 'Gisteren' }
    }

    return { periodArticles: [], periodLabel: 'Vandaag' }
  }, [articles])
}

interface ArticleMood {
  overallMood: string
  moodClass: string
  positiveArticles: NewsArticle[]
  negativeArticles: NewsArticle[]
  neutralArticles: NewsArticle[]
}

export function useArticleMood(articles: NewsArticle[]): ArticleMood {
  return useMemo(() => {
    const positiveArticles = articles.filter(a => a.sentiment === 'positive')
    const negativeArticles = articles.filter(a => a.sentiment === 'negative')
    const neutralArticles = articles.filter(a => a.sentiment === 'neutral')

    let overallMood: string
    let moodClass: string

    if (positiveArticles.length > negativeArticles.length && positiveArticles.length >= neutralArticles.length) {
      overallMood = 'Positief'; moodClass = 'sum-mood-p'
    } else if (negativeArticles.length > positiveArticles.length && negativeArticles.length >= neutralArticles.length) {
      overallMood = 'Negatief'; moodClass = 'sum-mood-n'
    } else if (positiveArticles.length > 0 && negativeArticles.length > 0) {
      overallMood = 'Gemengd'; moodClass = 'sum-mood-m'
    } else {
      overallMood = 'Neutraal'; moodClass = 'sum-mood-u'
    }

    return { overallMood, moodClass, positiveArticles, negativeArticles, neutralArticles }
  }, [articles])
}

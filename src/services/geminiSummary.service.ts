import { getTodayDateKey } from '../utils/timeFormatting.util'
import {
  createNotFoundError,
  createRateLimitError,
  createApiError,
  createEmptyResponseError,
  type AppError,
} from '../types/errors'
import type { NewsArticle } from '../types'

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const MAX_DAILY_REQUESTS = 20
const USAGE_STORAGE_KEY = 'gemini_usage'

interface DailyUsage {
  date: string
  count: number
}

export function getDailyUsageCount(): DailyUsage {
  try {
    const stored = localStorage.getItem(USAGE_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as DailyUsage
      if (parsed.date === getTodayDateKey()) return parsed
    }
  } catch {}
  return { date: getTodayDateKey(), count: 0 }
}

export function incrementDailyUsage(): number {
  const usage = getDailyUsageCount()
  usage.count++
  localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage))
  return usage.count
}

export function hasReachedDailyLimit(): boolean {
  return getDailyUsageCount().count >= MAX_DAILY_REQUESTS
}

export function getRemainingDailyCalls(): number {
  return MAX_DAILY_REQUESTS - getDailyUsageCount().count
}

function buildCacheKey(categoryId: string): string {
  return `gemini_sum_${categoryId}_${getTodayDateKey()}`
}

export function getCachedSummary(categoryId: string): string | null {
  try {
    return localStorage.getItem(buildCacheKey(categoryId))
  } catch {
    return null
  }
}

export function saveSummaryToCache(categoryId: string, summaryText: string): void {
  try {
    localStorage.setItem(buildCacheKey(categoryId), summaryText)
  } catch {}
}

export function removeExpiredCache(): void {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoffDate = sevenDaysAgo.toISOString().slice(0, 10)

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key?.startsWith('gemini_sum_')) {
        const dateInKey = key.split('_').pop() || ''
        if (dateInKey < cutoffDate) localStorage.removeItem(key)
      }
    }
  } catch {}
}

function buildSummaryPrompt(categoryName: string, articles: NewsArticle[]): string {
  const headlines = articles
    .slice(0, 15)
    .map(article => {
      const sentimentArrow =
        article.sentiment === 'positive' ? '↑' :
        article.sentiment === 'negative' ? '↓' : '→'
      return `${sentimentArrow} ${article.title}`
    })
    .join('\n')

  return `Je bent een financieel nieuwsanalist. Vat onderstaande nieuwskoppen van vandaag samen voor de categorie "${categoryName}" in 3-4 beknopte zinnen in het Nederlands. Focus op prijsbewegingen, risicosignalen en kansen voor beleggers. Wees concreet en vermijd algemeenheden.

Koppen:
${headlines}`
}

export interface SummaryResult {
  text: string
  error: null
}

export interface SummaryFailure {
  text: null
  error: AppError
}

export async function generateCategorySummary(
  apiKey: string,
  categoryId: string,
  categoryName: string,
  articles: NewsArticle[]
): Promise<SummaryResult | SummaryFailure> {
  if (!articles.length) {
    return { text: null, error: createNotFoundError('Geen artikelen beschikbaar om samen te vatten.') }
  }

  if (hasReachedDailyLimit()) {
    return { text: null, error: createRateLimitError(MAX_DAILY_REQUESTS) }
  }

  let response: Response
  try {
    response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildSummaryPrompt(categoryName, articles) }] }],
      }),
    })
  } catch {
    return { text: null, error: createApiError('Kan geen verbinding maken met de Gemini API.') }
  }

  if (!response.ok) {
    const statusCode = response.status
    if (statusCode === 429) {
      return { text: null, error: createRateLimitError(MAX_DAILY_REQUESTS) }
    }
    return { text: null, error: createApiError(`Gemini API gaf status ${statusCode} terug.`, statusCode) }
  }

  const data = await response.json()
  const summaryText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

  if (!summaryText) {
    return { text: null, error: createEmptyResponseError('De AI gaf geen bruikbare samenvatting terug.') }
  }

  saveSummaryToCache(categoryId, summaryText)
  incrementDailyUsage()

  return { text: summaryText, error: null }
}

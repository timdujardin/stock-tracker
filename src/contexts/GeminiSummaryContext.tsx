import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import {
  getDailyUsageCount,
  getCachedSummary,
  removeExpiredCache,
  generateCategorySummary,
  getRemainingDailyCalls,
} from '../services/geminiSummary.service'
import { CATEGORY_IDS } from '../config/feedSources.config'
import type { NewsArticle } from '../types'
import type { AppError } from '../types/errors'

interface GeminiSummaryContextValue {
  summaries: Record<string, string>
  summaryErrors: Record<string, AppError>
  isGenerating: Record<string, boolean>
  isAvailable: boolean
  dailyUsageCount: number
  remainingCalls: number
  loadCachedSummaries: () => void
  generateSummary: (categoryId: string, categoryName: string, articles: NewsArticle[]) => Promise<void>
  clearSummaryError: (categoryId: string) => void
}

const GeminiSummaryContext = createContext<GeminiSummaryContextValue | null>(null)

export function GeminiSummaryProvider({ children }: { children: ReactNode }) {
  const [summaries, setSummaries] = useState<Record<string, string>>({})
  const [summaryErrors, setSummaryErrors] = useState<Record<string, AppError>>({})
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({})
  const [dailyUsageCount, setDailyUsageCount] = useState(() => getDailyUsageCount().count)

  const apiKey = import.meta.env.VITE_GEMINI_KEY as string | undefined
  const isAvailable = !!apiKey

  const refreshUsageCount = useCallback(() => {
    setDailyUsageCount(getDailyUsageCount().count)
  }, [])

  const loadCachedSummaries = useCallback(() => {
    removeExpiredCache()
    const cached: Record<string, string> = {}
    CATEGORY_IDS.forEach(categoryId => {
      const cachedText = getCachedSummary(categoryId)
      if (cachedText) cached[categoryId] = cachedText
    })
    setSummaries(prev => ({ ...prev, ...cached }))
    refreshUsageCount()
  }, [refreshUsageCount])

  const clearSummaryError = useCallback((categoryId: string) => {
    setSummaryErrors(prev => {
      const next = { ...prev }
      delete next[categoryId]
      return next
    })
  }, [])

  const generateSummary = useCallback(async (
    categoryId: string,
    categoryName: string,
    articles: NewsArticle[]
  ) => {
    if (!apiKey || !articles.length) return

    setIsGenerating(prev => ({ ...prev, [categoryId]: true }))
    clearSummaryError(categoryId)

    try {
      const result = await generateCategorySummary(apiKey, categoryId, categoryName, articles)

      if (result.error) {
        setSummaryErrors(prev => ({ ...prev, [categoryId]: result.error! }))
      } else {
        setSummaries(prev => ({ ...prev, [categoryId]: result.text! }))
      }

      refreshUsageCount()
    } catch {
      setSummaryErrors(prev => ({
        ...prev,
        [categoryId]: { type: 'ApiError', message: 'Onverwachte fout bij het genereren van de samenvatting.' },
      }))
    } finally {
      setIsGenerating(prev => ({ ...prev, [categoryId]: false }))
    }
  }, [apiKey, refreshUsageCount, clearSummaryError])

  const value: GeminiSummaryContextValue = {
    summaries,
    summaryErrors,
    isGenerating,
    isAvailable,
    dailyUsageCount,
    remainingCalls: getRemainingDailyCalls(),
    loadCachedSummaries,
    generateSummary,
    clearSummaryError,
  }

  return (
    <GeminiSummaryContext.Provider value={value}>
      {children}
    </GeminiSummaryContext.Provider>
  )
}

export function useGeminiSummary(): GeminiSummaryContextValue {
  const context = useContext(GeminiSummaryContext)
  if (!context) throw new Error('useGeminiSummary must be used within GeminiSummaryProvider')
  return context
}

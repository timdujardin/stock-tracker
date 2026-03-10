export type WeekBucket = 'thisWeek' | 'lastWeek' | 'older'

export function parsePublishedDate(dateString: string): number {
  if (!dateString) return 0
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? 0 : date.getTime()
}

export function formatTimeAgo(timestamp: number): string {
  if (!timestamp) return ''
  const secondsAgo = Math.floor((Date.now() - timestamp) / 1000)
  if (secondsAgo < 60) return 'nu'
  if (secondsAgo < 3600) return Math.floor(secondsAgo / 60) + 'm'
  if (secondsAgo < 86400) return Math.floor(secondsAgo / 3600) + 'u'
  return new Date(timestamp).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
}

export function getWeekBucket(timestamp: number): WeekBucket {
  if (!timestamp) return 'older'
  const daysAgo = (Date.now() - timestamp) / 86400000
  if (daysAgo < 7) return 'thisWeek'
  if (daysAgo < 14) return 'lastWeek'
  return 'older'
}

export function formatDayGroupLabel(timestamp: number): string {
  if (!timestamp) return 'Onbekend'
  const secondsAgo = Math.floor((Date.now() - timestamp) / 1000)
  if (secondsAgo < 3600) return 'Afgelopen uur'
  if (secondsAgo < 86400) return 'Vandaag'
  if (secondsAgo < 172800) return 'Gisteren'
  return new Date(timestamp).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function getStartOfToday(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

export function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10)
}

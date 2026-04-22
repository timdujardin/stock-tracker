import {
  DAYS_PER_WEEK,
  DAYS_TWO_WEEKS,
  MS_PER_DAY,
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
  SECONDS_TWO_DAYS,
} from '@/config/app.config';

/** Represents the relative week grouping for an article. */
export type WeekBucket = 'thisWeek' | 'lastWeek' | 'older';

/**
 * Parses a date string into a Unix timestamp in milliseconds.
 * @param dateString - The date string to parse
 * @returns Timestamp in ms, or 0 if invalid
 */
export const parsePublishedDate = (dateString: string): number => {
  if (!dateString) {
    return 0;
  }
  const date = new Date(dateString);

  return isNaN(date.getTime()) ? 0 : date.getTime();
};

/**
 * Formats a timestamp as a human-readable relative time string (Dutch).
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time label (e.g. "nu", "5m", "3u") or formatted date
 */
export const formatTimeAgo = (timestamp: number): string => {
  if (!timestamp) {
    return '';
  }
  const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);
  if (secondsAgo < SECONDS_PER_MINUTE) {
    return 'nu';
  }
  if (secondsAgo < SECONDS_PER_HOUR) {
    return Math.floor(secondsAgo / SECONDS_PER_MINUTE) + 'm';
  }
  if (secondsAgo < SECONDS_PER_DAY) {
    return Math.floor(secondsAgo / SECONDS_PER_HOUR) + 'u';
  }

  return new Date(timestamp).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' });
};

/**
 * Assigns a timestamp to a week-based grouping bucket.
 * @param timestamp - Unix timestamp in milliseconds
 * @returns The week bucket the timestamp falls into
 */
export const getWeekBucket = (timestamp: number): WeekBucket => {
  if (!timestamp) {
    return 'older';
  }
  const daysAgo = (Date.now() - timestamp) / MS_PER_DAY;
  if (daysAgo < DAYS_PER_WEEK) {
    return 'thisWeek';
  }
  if (daysAgo < DAYS_TWO_WEEKS) {
    return 'lastWeek';
  }

  return 'older';
};

/**
 * Formats a timestamp into a day-level group label (Dutch).
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Label such as "Vandaag", "Gisteren", or a full date string
 */
export const formatDayGroupLabel = (timestamp: number): string => {
  if (!timestamp) {
    return 'Onbekend';
  }
  const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);
  if (secondsAgo < SECONDS_PER_HOUR) {
    return 'Afgelopen uur';
  }
  if (secondsAgo < SECONDS_PER_DAY) {
    return 'Vandaag';
  }
  if (secondsAgo < SECONDS_TWO_DAYS) {
    return 'Gisteren';
  }

  return new Date(timestamp).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' });
};

/**
 * Returns the Unix timestamp for the start of today (midnight local time).
 * @returns Timestamp in milliseconds
 */
export const getStartOfToday = (): number => {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

/**
 * Returns today's date as a YYYY-MM-DD key in the America/Los_Angeles timezone.
 * Aligned with Gemini API daily quota reset (midnight Pacific Time).
 */
export const getTodayDateKey = (): string => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
};

/** Maximum number of articles displayed per category section */
export const CATEGORY_ARTICLE_LIMIT = 20;

/** Number of articles loaded per page in the article slider */
export const SLIDER_PAGE_SIZE = 10;

/** Number of headline previews shown in the day summary */
export const HEADLINE_PREVIEW_LIMIT = 2;

/** Maximum number of headlines included in the AI summary prompt */
export const MAX_SUMMARY_HEADLINES = 15;

/** Number of days before cached summaries expire */
export const SUMMARY_CACHE_TTL_DAYS = 7;

/** Maximum character length used for deduplication keys */
export const DEDUP_KEY_LENGTH = 80;

/** Milliseconds in one day */
export const MS_PER_DAY = 86_400_000;

/** Seconds per minute */
export const SECONDS_PER_MINUTE = 60;

/** Seconds per hour */
export const SECONDS_PER_HOUR = 3_600;

/** Seconds per day */
export const SECONDS_PER_DAY = 86_400;

/** Seconds for the "yesterday" threshold (two days) */
export const SECONDS_TWO_DAYS = 172_800;

/** Number of days in one week */
export const DAYS_PER_WEEK = 7;

/** Number of days spanning two weeks */
export const DAYS_TWO_WEEKS = 14;

/** HTTP status code for rate limiting */
export const HTTP_RATE_LIMIT = 429;

/** Maximum daily Gemini API requests */
export const MAX_DAILY_REQUESTS = 20;

/** Number of days before cached outlooks expire */
export const OUTLOOK_CACHE_TTL_DAYS = 7;

/** Maximum number of headlines included in the outlook prompt */
export const MAX_OUTLOOK_HEADLINES = 15;

/** Maximum absolute score on the outlook Y-axis */
export const OUTLOOK_SCORE_RANGE = 10;

/** Categories excluded from the 10-year outlook chart */
export const OUTLOOK_EXCLUDED_CATEGORIES: string[] = ['vd'];

/** Maximum number of days shown in the sentiment trend chart */
export const MAX_TREND_DAYS = 14;

/** Minimum number of distinct days required to render the trend chart */
export const MIN_TREND_CHART_DAYS = 2;

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

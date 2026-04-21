const RETRYABLE_STATUS_CODES = new Set([500, 503]);
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wraps `fetch` with automatic retry and exponential backoff for transient server errors (500, 503).
 * Non-retryable responses (including 429) are returned immediately.
 */
export const fetchWithRetry = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let lastResponse: Response | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await delay(BASE_DELAY_MS * 2 ** (attempt - 1));
    }
    const response = await fetch(input, init);
    if (!RETRYABLE_STATUS_CODES.has(response.status)) {
      return response;
    }
    lastResponse = response;
  }

  return lastResponse!;
};

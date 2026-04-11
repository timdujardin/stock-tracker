/** Per-category blocklist of terms that cause an article to be skipped during ingestion */
export const EXCLUDED_TITLE_TERMS: Record<string, string[]> = {
  iv: ['ivn.be', 'euronext brussels'],
};

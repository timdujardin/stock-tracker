/**
 * Removes HTML tags and decodes common HTML entities from a string.
 * @param rawText - The raw HTML string to clean
 * @returns Plain text with tags stripped and entities decoded
 */
const HTML_TAG_REGEX = /<\/?\w[^>]*>/g;

export const stripHtmlTags = (rawText: string): string => {
  return (rawText || '')
    .replace(HTML_TAG_REGEX, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
};

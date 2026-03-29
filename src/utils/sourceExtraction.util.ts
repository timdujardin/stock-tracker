/**
 * Extracts the hostname from a URL, stripping the "www." prefix.
 * @param url - The full URL to extract the domain from
 * @returns The bare domain name, or empty string on failure
 */
export const getDomainFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

/**
 * Splits a raw article title into a clean title and source name.
 * @param title - The raw article title, possibly containing a source suffix
 * @param link - The article URL used as fallback source
 * @returns Object with cleaned title and extracted source name
 */
export const extractArticleSource = (title: string, link: string): { title: string; sourceName: string } => {
  const domain = getDomainFromUrl(link);

  if (!domain.includes('google.com')) {
    return { title, sourceName: domain };
  }

  const match = title.match(/^(.*)\s[-–—]\s([^-–—]+)$/);
  if (match) {
    return { title: match[1].trim(), sourceName: match[2].trim() };
  }

  return { title, sourceName: '' };
};

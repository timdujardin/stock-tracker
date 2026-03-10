export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function extractArticleSource(title: string, link: string): { title: string; sourceName: string } {
  const domain = getDomainFromUrl(link)

  if (!domain.includes('google.com')) {
    return { title, sourceName: domain }
  }

  const match = title.match(/^(.*)\s[-–—]\s([^-–—]+)$/)
  if (match) {
    return { title: match[1].trim(), sourceName: match[2].trim() }
  }

  return { title, sourceName: '' }
}

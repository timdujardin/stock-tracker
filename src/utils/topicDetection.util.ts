import { TOPIC_KEYWORDS } from '@/config/topicKeywords.config';

/**
 * Detects which topic categories match the given article title.
 * @param title - The article title to scan for topic keywords
 * @returns Array of matching category IDs
 */
export const detectMatchingTopics = (title: string): string[] => {
  const lowercaseTitle = title.toLowerCase();

  return Object.entries(TOPIC_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => lowercaseTitle.includes(keyword)))
    .map(([categoryId]) => categoryId);
};

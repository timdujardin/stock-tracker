import { TOPIC_KEYWORDS } from '../config/topicKeywords.config'

export function detectMatchingTopics(title: string): string[] {
  const lowercaseTitle = title.toLowerCase()
  return Object.entries(TOPIC_KEYWORDS)
    .filter(([, keywords]) => keywords.some(keyword => lowercaseTitle.includes(keyword)))
    .map(([categoryId]) => categoryId)
}

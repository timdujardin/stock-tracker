import { MAX_TREND_DAYS } from '@/config/app.config';
import type { NewsArticle } from '@/types';

const SHORT_WEEKDAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

export interface DailySentiment {
  date: string;
  timestamp: number;
  score: number;
  positive: number;
  negative: number;
  neutral: number;
}

/** Groups articles by calendar day and computes net sentiment (positive - negative) per day. */
export const aggregateDailySentiment = (articles: NewsArticle[]): DailySentiment[] => {
  const buckets = new Map<string, DailySentiment>();

  for (const article of articles) {
    if (!article.publishedAt) {
      continue;
    }

    const d = new Date(article.publishedAt);
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

    let bucket = buckets.get(dayKey);
    if (!bucket) {
      const label = `${SHORT_WEEKDAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
      bucket = {
        date: label,
        timestamp: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
        score: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
      };
      buckets.set(dayKey, bucket);
    }

    if (article.sentiment === 'positive') {
      bucket.positive++;
    } else if (article.sentiment === 'negative') {
      bucket.negative++;
    } else {
      bucket.neutral++;
    }
  }

  const sorted = [...buckets.values()].sort((a, b) => a.timestamp - b.timestamp);

  return sorted.slice(-MAX_TREND_DAYS).map((b) => ({ ...b, score: b.positive - b.negative }));
};

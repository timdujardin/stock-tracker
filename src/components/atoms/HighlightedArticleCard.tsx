import type { FC } from 'react';

import './HighlightedArticleCard.css';

import { SENTIMENT_DISPLAY } from '@/config/sentimentKeywords.config';
import type { NewsArticle } from '@/types';
import { formatTimeAgo } from '@/utils/timeFormatting.util';

import { highlightedCard } from './HighlightedArticleCard.styles';

interface HighlightedArticleCardProps {
  article: NewsArticle;
}

/** Renders the most recent article as a large vertical card with gradient placeholder */
export const HighlightedArticleCard: FC<HighlightedArticleCardProps> = ({ article }) => {
  const sentimentStyle = SENTIMENT_DISPLAY[article.sentiment];

  return (
    <a className={highlightedCard({ sentiment: article.sentiment })} href={article.link} target="_blank" rel="noopener">
      <div className="highlighted-card__body">
        <span className={`card-pill ${sentimentStyle.pillClass}`}>
          {sentimentStyle.icon} {sentimentStyle.label}
        </span>
        <div className="card-meta">
          <span className="card-time">{formatTimeAgo(article.publishedAt)}</span>
          {article.sourceName && (
            <>
              <span className="card-meta__sep">&middot;</span>
              <span className="card-source">{article.sourceName}</span>
            </>
          )}
        </div>
        <span className="highlighted-card__title">{article.title}</span>
        <span className="card-cta">Lees artikel &rarr;</span>
      </div>
    </a>
  );
};

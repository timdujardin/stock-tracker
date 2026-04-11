import type { FC } from 'react';

import './ArticleCard.css';

import { SENTIMENT_DISPLAY } from '@/config/sentimentKeywords.config';
import type { NewsArticle } from '@/types';
import { formatTimeAgo } from '@/utils/timeFormatting.util';

import { articleCard } from './ArticleCard.styles';

interface ArticleCardProps {
  article: NewsArticle;
}

/** Renders an article as a horizontal card with 1/3 gradient and 2/3 content */
export const ArticleCard: FC<ArticleCardProps> = ({ article }) => {
  const sentimentStyle = SENTIMENT_DISPLAY[article.sentiment];

  return (
    <a className={articleCard({ sentiment: article.sentiment })} href={article.link} target="_blank" rel="noopener">
      <div className="article-card__body">
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
        <span className="article-card__title">{article.title}</span>
        <span className="card-cta">Lees artikel &rarr;</span>
      </div>
    </a>
  );
};

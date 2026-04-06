import './SentimentTrendChart.css';

import type { FC } from 'react';
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { MIN_TREND_CHART_DAYS } from '@/config/app.config';
import { useSentimentTrend } from '@/hooks/sentimentTrend.hooks';
import type { NewsArticle } from '@/types';
import type { DailySentiment } from '@/utils/sentimentTrend.util';

const GRADIENT_ID = 'sentimentGradient';

interface SentimentTrendChartProps {
  articles: NewsArticle[];
}

const CustomTooltip: FC<{ active?: boolean; payload?: { payload: DailySentiment }[] }> = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const d = payload[0].payload;

  return (
    <div className="sentiment-trend__tooltip">
      <div className="sentiment-trend__tooltip-date">{d.date}</div>
      <div className="sentiment-trend__tooltip-row">
        <span className="sentiment-trend__tooltip-dot" style={{ background: 'var(--md-positive)' }} />
        {d.positive} positief
      </div>
      <div className="sentiment-trend__tooltip-row">
        <span className="sentiment-trend__tooltip-dot" style={{ background: 'var(--md-negative)' }} />
        {d.negative} negatief
      </div>
      <div className="sentiment-trend__tooltip-row">
        <span className="sentiment-trend__tooltip-dot" style={{ background: 'var(--md-bar-neutral)' }} />
        {d.neutral} neutraal
      </div>
    </div>
  );
};

/** Renders a daily sentiment trend area chart for a set of articles. */
export const SentimentTrendChart: FC<SentimentTrendChartProps> = ({ articles }) => {
  const trend = useSentimentTrend(articles);

  if (trend.length < MIN_TREND_CHART_DAYS) {
    return null;
  }

  const maxAbsScore = Math.max(1, ...trend.map((d) => Math.abs(d.score)));
  const yDomain: [number, number] = [-maxAbsScore, maxAbsScore];

  return (
    <div className="sentiment-trend">
      <div className="sentiment-trend__header">📈 Sentiment trend</div>
      <p className="sentiment-trend__description">
        Netto score per dag: positieve min negatieve artikelen. Boven de nullijn is overwegend positief, eronder
        negatief. Tik op een punt voor details.
      </p>
      <div className="sentiment-trend__chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--md-positive)" stopOpacity={0.4} />
                <stop offset="50%" stopColor="var(--md-positive)" stopOpacity={0.05} />
                <stop offset="50%" stopColor="var(--md-negative)" stopOpacity={0.05} />
                <stop offset="100%" stopColor="var(--md-negative)" stopOpacity={0.4} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--md-on-surface-variant)' }}
              axisLine={{ stroke: 'var(--md-outline-variant)' }}
              tickLine={false}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 11, fill: 'var(--md-on-surface-variant)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />

            <ReferenceLine y={0} stroke="var(--md-outline-variant)" strokeDasharray="3 3" />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--md-outline)', strokeWidth: 1 }} />

            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--md-on-surface)"
              strokeWidth={2}
              fill={`url(#${GRADIENT_ID})`}
              dot={{ r: 3, fill: 'var(--md-surface)', stroke: 'var(--md-on-surface)', strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: 'var(--md-primary)', stroke: 'var(--md-surface)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

import './SentimentTrendChart.css';
import './OutlookChart.css';

import type { FC } from 'react';
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ErrorDisplay } from '@/components/atoms/ErrorDisplay';
import { MIN_TREND_CHART_DAYS, OUTLOOK_SCORE_RANGE } from '@/config/app.config';
import { useAutoOutlook } from '@/hooks/outlook.hooks';
import { useSentimentTrend } from '@/hooks/sentimentTrend.hooks';
import type { NewsArticle, OutlookDataPoint } from '@/types';
import type { DailySentiment } from '@/utils/sentimentTrend.util';

const TREND_LINE_GRADIENT = 'trendLineGradient';
const OUTLOOK_LINE_GRADIENT = 'outlookLineGradient';

const YEAR_LABELS: Record<number, string> = {
  0: 'Nu',
  1: '1j',
  2: '2j',
  5: '5j',
  8: '8j',
  10: '10j',
};

interface SentimentTrendChartProps {
  articles: NewsArticle[];
  categoryId?: string;
  categoryName?: string;
  showOutlook?: boolean;
}

interface OutlookChartDataPoint extends OutlookDataPoint {
  label: string;
}

const scoreDotColor = (score: number): string => {
  if (score > 0) return 'var(--md-positive)';
  if (score < 0) return 'var(--md-negative)';
  return 'var(--md-on-surface)';
};

const TrendDot: FC<{ cx?: number; cy?: number; payload?: DailySentiment }> = ({ cx, cy, payload }) => {
  if (cx == null || cy == null || !payload) return null;
  return <circle cx={cx} cy={cy} r={4} fill={scoreDotColor(payload.score)} stroke="var(--md-surface)" strokeWidth={1.5} />;
};

const TrendActiveDot: FC<{ cx?: number; cy?: number; payload?: DailySentiment }> = ({ cx, cy, payload }) => {
  if (cx == null || cy == null || !payload) return null;
  return <circle cx={cx} cy={cy} r={6} fill={scoreDotColor(payload.score)} stroke="var(--md-surface)" strokeWidth={2} />;
};

const TrendTooltip: FC<{ active?: boolean; payload?: { payload: DailySentiment }[] }> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

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

const OutlookDot: FC<{ cx?: number; cy?: number; payload?: OutlookChartDataPoint }> = ({ cx, cy, payload }) => {
  if (cx == null || cy == null || !payload) return null;
  return <circle cx={cx} cy={cy} r={4} fill={scoreDotColor(payload.score)} stroke="var(--md-surface)" strokeWidth={1.5} />;
};

const OutlookActiveDot: FC<{ cx?: number; cy?: number; payload?: OutlookChartDataPoint }> = ({ cx, cy, payload }) => {
  if (cx == null || cy == null || !payload) return null;
  return <circle cx={cx} cy={cy} r={6} fill={scoreDotColor(payload.score)} stroke="var(--md-surface)" strokeWidth={2} />;
};

const OutlookTooltip: FC<{ active?: boolean; payload?: { payload: OutlookChartDataPoint }[] }> = ({
  active,
  payload,
}) => {
  if (!active || !payload?.length) return null;

  const d = payload[0].payload;
  const sign = d.score > 0 ? '+' : '';
  return (
    <div className="sentiment-trend__tooltip">
      <div className="sentiment-trend__tooltip-date">{d.label}</div>
      <div className="sentiment-trend__tooltip-row">
        Score: {sign}
        {d.score}
      </div>
    </div>
  );
};

/** Renders daily sentiment trend and optional 10-year outlook within a single card. */
export const SentimentTrendChart: FC<SentimentTrendChartProps> = ({
  articles,
  categoryId,
  categoryName,
  showOutlook = false,
}) => {
  const trend = useSentimentTrend(articles);
  const hasTrend = trend.length >= MIN_TREND_CHART_DAYS;

  if (!hasTrend && !showOutlook) return null;

  const maxAbsScore = Math.max(1, ...trend.map((d) => Math.abs(d.score)));
  const trendYDomain: [number, number] = [-maxAbsScore, maxAbsScore];

  return (
    <div className="sentiment-trend">
      {hasTrend ? (
        <>
          <div className="sentiment-trend__header">📈 Sentiment trend</div>
          <p className="sentiment-trend__description">
            Netto score per dag: positieve min negatieve artikelen. Groene punten zijn positief, rode negatief. Tik op
            een punt voor details.
          </p>
          <div className="sentiment-trend__chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id={TREND_LINE_GRADIENT} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--md-positive)" />
                    <stop offset="48%" stopColor="var(--md-positive)" />
                    <stop offset="48%" stopColor="var(--md-on-surface)" />
                    <stop offset="52%" stopColor="var(--md-on-surface)" />
                    <stop offset="52%" stopColor="var(--md-negative)" />
                    <stop offset="100%" stopColor="var(--md-negative)" />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--md-on-surface-variant)' }}
                  axisLine={{ stroke: 'var(--md-outline-variant)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={trendYDomain}
                  tick={{ fontSize: 11, fill: 'var(--md-on-surface-variant)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />

                <ReferenceLine y={0} stroke="var(--md-outline-variant)" strokeDasharray="3 3" />
                <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'var(--md-outline)', strokeWidth: 1 }} />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={`url(#${TREND_LINE_GRADIENT})`}
                  strokeWidth={2}
                  dot={<TrendDot />}
                  activeDot={<TrendActiveDot />}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : null}

      {showOutlook && categoryId && categoryName ? (
        <OutlookSection
          categoryId={categoryId}
          categoryName={categoryName}
          articles={articles}
          hasTrendAbove={hasTrend}
        />
      ) : null}
    </div>
  );
};

interface OutlookSectionProps {
  categoryId: string;
  categoryName: string;
  articles: NewsArticle[];
  hasTrendAbove: boolean;
}

const OutlookSection: FC<OutlookSectionProps> = ({ categoryId, categoryName, articles, hasTrendAbove }) => {
  const { outlook, error, isGenerating, isAvailable, remainingCalls, refresh } = useAutoOutlook(
    categoryId,
    categoryName,
    articles,
  );

  if (!isAvailable) return null;

  const hasReachedLimit = remainingCalls <= 0;

  return (
    <div className={hasTrendAbove ? 'sentiment-trend__outlook-divider' : undefined}>
      <div className="outlook-chart__header">
        <span>🔮 10-jaars outlook</span>
        <button
          type="button"
          className="outlook-chart__refresh"
          onClick={refresh}
          disabled={isGenerating || hasReachedLimit}
        >
          {isGenerating ? 'Laden…' : '↻ Vernieuwen'}
        </button>
      </div>

      {error ? <ErrorDisplay error={error} onRetry={refresh} compact /> : null}

      {!error && isGenerating && !outlook ? (
        <div className="outlook-chart__loading">Outlook genereren…</div>
      ) : null}

      {!error && outlook ? <OutlookContent outlook={outlook} /> : null}
    </div>
  );
};

interface OutlookContentProps {
  outlook: {
    dataPoints: OutlookDataPoint[];
    bullish: string[];
    bearish: string[];
    summary: string;
  };
}

const OutlookContent: FC<OutlookContentProps> = ({ outlook }) => {
  const chartData: OutlookChartDataPoint[] = outlook.dataPoints.map((p) => ({
    ...p,
    label: YEAR_LABELS[p.year] ?? `${p.year}j`,
  }));

  const yDomain: [number, number] = [-OUTLOOK_SCORE_RANGE, OUTLOOK_SCORE_RANGE];

  return (
    <>
      {outlook.summary ? <p className="outlook-chart__summary">{outlook.summary}</p> : null}

      <div className="outlook-chart__area">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={OUTLOOK_LINE_GRADIENT} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--md-positive)" />
                <stop offset="48%" stopColor="var(--md-positive)" />
                <stop offset="48%" stopColor="var(--md-on-surface)" />
                <stop offset="52%" stopColor="var(--md-on-surface)" />
                <stop offset="52%" stopColor="var(--md-negative)" />
                <stop offset="100%" stopColor="var(--md-negative)" />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
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
            <Tooltip content={<OutlookTooltip />} cursor={{ stroke: 'var(--md-outline)', strokeWidth: 1 }} />

            <Line
              type="monotone"
              dataKey="score"
              stroke={`url(#${OUTLOOK_LINE_GRADIENT})`}
              strokeWidth={2}
              dot={<OutlookDot />}
              activeDot={<OutlookActiveDot />}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {outlook.bullish.length > 0 || outlook.bearish.length > 0 ? (
        <div className="outlook-chart__factors">
          {outlook.bullish.length > 0 ? (
            <div className="outlook-chart__factor-group">
              <div className="outlook-chart__factor-label">↑ Bullish</div>
              <div className="outlook-chart__pills">
                {outlook.bullish.map((factor) => (
                  <span key={factor} className="outlook-chart__pill outlook-chart__pill--bullish">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {outlook.bearish.length > 0 ? (
            <div className="outlook-chart__factor-group">
              <div className="outlook-chart__factor-label">↓ Bearish</div>
              <div className="outlook-chart__pills">
                {outlook.bearish.map((factor) => (
                  <span key={factor} className="outlook-chart__pill outlook-chart__pill--bearish">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

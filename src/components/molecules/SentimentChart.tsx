import { SentimentBar } from '../atoms/SentimentBar'

interface SentimentChartProps {
  positiveCount: number
  negativeCount: number
  neutralCount: number
}

export function SentimentChart({ positiveCount, negativeCount, neutralCount }: SentimentChartProps) {
  return (
    <>
      <SentimentBar
        positiveCount={positiveCount}
        negativeCount={negativeCount}
        neutralCount={neutralCount}
        className="feed-col-chart"
      />
      <div className="feed-col-chart-lbl">
        <span className="cl-p">↑ {positiveCount}</span>
        <span className="cl-n">↓ {negativeCount}</span>
        <span className="cl-u">→ {neutralCount}</span>
      </div>
    </>
  )
}

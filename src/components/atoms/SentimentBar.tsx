interface SentimentBarProps {
  positiveCount: number
  negativeCount: number
  neutralCount: number
  className?: string
}

export function SentimentBar({ positiveCount, negativeCount, neutralCount, className }: SentimentBarProps) {
  return (
    <div className={className || 'sentiment-bar'}>
      <span className="sb-p" style={{ flex: positiveCount }} />
      <span className="sb-n" style={{ flex: negativeCount }} />
      <span className="sb-u" style={{ flex: neutralCount }} />
    </div>
  )
}

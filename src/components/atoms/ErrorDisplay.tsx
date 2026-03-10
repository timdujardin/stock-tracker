import { getErrorDisplay, type AppError } from '../../types/errors'

interface ErrorDisplayProps {
  error: AppError
  onRetry?: () => void
  compact?: boolean
}

export function ErrorDisplay({ error, onRetry, compact }: ErrorDisplayProps) {
  const { icon, title } = getErrorDisplay(error)

  if (compact) {
    return (
      <div className="error-compact">
        <span className="error-compact-icon">{icon}</span>
        <span className="error-compact-msg">{error.message}</span>
        {onRetry && (
          <button className="error-compact-retry" onClick={onRetry}>↻</button>
        )}
      </div>
    )
  }

  return (
    <div className="error-card">
      <div className="error-icon">{icon}</div>
      <div className="error-title">{title}</div>
      <div className="error-message">{error.message}</div>
      {onRetry && (
        <button className="error-retry" onClick={onRetry}>
          ↻ Opnieuw proberen
        </button>
      )}
    </div>
  )
}

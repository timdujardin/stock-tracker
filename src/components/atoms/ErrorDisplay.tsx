import type { FC } from 'react';

import './ErrorDisplay.css';

import { getErrorDisplay, type AppError } from '@/types/errors';

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  compact?: boolean;
}

/** Renders an error message with optional retry button in full or compact layout */
export const ErrorDisplay: FC<ErrorDisplayProps> = ({ error, onRetry, compact }) => {
  const { icon, title } = getErrorDisplay(error);

  if (compact) {
    return (
      <div className="error-compact">
        <span className="error-compact-icon">{icon}</span>
        <span className="error-compact-msg">{error.message}</span>
        {onRetry ? (
          <button type="button" className="error-compact-retry" onClick={onRetry} aria-label="Opnieuw proberen">
            ↻
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="error-card">
      <div className="error-icon">{icon}</div>
      <div className="error-title">{title}</div>
      <div className="error-message">{error.message}</div>
      {onRetry ? (
        <button type="button" className="error-retry" onClick={onRetry}>
          ↻ Opnieuw proberen
        </button>
      ) : null}
    </div>
  );
};

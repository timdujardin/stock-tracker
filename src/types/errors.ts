export interface NotFoundError {
  type: 'NotFoundError'
  message: string
}

export interface NetworkError {
  type: 'NetworkError'
  message: string
  url?: string
}

export interface ApiError {
  type: 'ApiError'
  message: string
  statusCode?: number
}

export interface RateLimitError {
  type: 'RateLimitError'
  message: string
  limitPerDay: number
}

export interface EmptyResponseError {
  type: 'EmptyResponseError'
  message: string
}

export interface ParseError {
  type: 'ParseError'
  message: string
  source?: string
}

export type AppError =
  | NotFoundError
  | NetworkError
  | ApiError
  | RateLimitError
  | EmptyResponseError
  | ParseError

export function createNotFoundError(message = 'Geen resultaten gevonden.'): NotFoundError {
  return { type: 'NotFoundError', message }
}

export function createNetworkError(message = 'Kan geen verbinding maken met de server.', url?: string): NetworkError {
  return { type: 'NetworkError', message, url }
}

export function createApiError(message = 'De API gaf een fout terug.', statusCode?: number): ApiError {
  return { type: 'ApiError', message, statusCode }
}

export function createRateLimitError(limitPerDay: number): RateLimitError {
  return {
    type: 'RateLimitError',
    message: `Daglimiet van ${limitPerDay} verzoeken bereikt. Probeer morgen opnieuw.`,
    limitPerDay,
  }
}

export function createEmptyResponseError(message = 'De server gaf een leeg antwoord terug.'): EmptyResponseError {
  return { type: 'EmptyResponseError', message }
}

export function createParseError(message = 'Fout bij het verwerken van de gegevens.', source?: string): ParseError {
  return { type: 'ParseError', message, source }
}

const ERROR_CONFIG: Record<AppError['type'], { icon: string; title: string }> = {
  NotFoundError:     { icon: '🔍', title: 'Niet gevonden' },
  NetworkError:      { icon: '🌐', title: 'Verbindingsfout' },
  ApiError:          { icon: '⚠️', title: 'API-fout' },
  RateLimitError:    { icon: '⏳', title: 'Limiet bereikt' },
  EmptyResponseError:{ icon: '📭', title: 'Leeg antwoord' },
  ParseError:        { icon: '⚙️', title: 'Verwerkingsfout' },
}

export function getErrorDisplay(error: AppError) {
  return ERROR_CONFIG[error.type]
}

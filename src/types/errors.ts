/** Error when a requested resource is not found. */
export interface NotFoundError {
  type: 'NotFoundError';
  message: string;
}

/** Error when a network request fails. */
export interface NetworkError {
  type: 'NetworkError';
  message: string;
  url?: string;
}

/** Error when an API returns an unexpected response. */
export interface ApiError {
  type: 'ApiError';
  message: string;
  statusCode?: number;
}

/** Error when the daily API call limit is exceeded. */
export interface RateLimitError {
  type: 'RateLimitError';
  message: string;
  limitPerDay: number;
}

/** Error when a server returns an empty response body. */
export interface EmptyResponseError {
  type: 'EmptyResponseError';
  message: string;
}

/** Error when response data cannot be parsed. */
export interface ParseError {
  type: 'ParseError';
  message: string;
  source?: string;
}

/** Union of all application error types. */
export type AppError = NotFoundError | NetworkError | ApiError | RateLimitError | EmptyResponseError | ParseError;

/**
 * Creates a NotFoundError with the given message.
 * @param message - Error description.
 * @returns A NotFoundError object.
 */
export const createNotFoundError = (message = 'Geen resultaten gevonden.'): NotFoundError => {
  return { type: 'NotFoundError', message };
};

/**
 * Creates a NetworkError with the given message and optional URL.
 * @param message - Error description.
 * @param url - The URL that failed.
 * @returns A NetworkError object.
 */
export const createNetworkError = (
  message = 'Kan geen verbinding maken met de server.',
  url?: string,
): NetworkError => {
  return { type: 'NetworkError', message, url };
};

/**
 * Creates an ApiError with the given message and optional status code.
 * @param message - Error description.
 * @param statusCode - HTTP status code.
 * @returns An ApiError object.
 */
export const createApiError = (message = 'De API gaf een fout terug.', statusCode?: number): ApiError => {
  return { type: 'ApiError', message, statusCode };
};

/** Gemini RPD resets at midnight Pacific Time = 09:00 Brussels (both CET and CEST). */
const GEMINI_RESET_BRUSSELS = '09:00';

/**
 * Creates a RateLimitError for the given daily limit.
 * @param limitPerDay - Maximum allowed API calls per day.
 * @returns A RateLimitError object.
 */
export const createRateLimitError = (limitPerDay: number): RateLimitError => {
  return {
    type: 'RateLimitError',
    message: `Daglimiet van ${limitPerDay} verzoeken bereikt. Reset om ${GEMINI_RESET_BRUSSELS}.`,
    limitPerDay,
  };
};

/**
 * Creates an EmptyResponseError with the given message.
 * @param message - Error description.
 * @returns An EmptyResponseError object.
 */
export const createEmptyResponseError = (message = 'De server gaf een leeg antwoord terug.'): EmptyResponseError => {
  return { type: 'EmptyResponseError', message };
};

/**
 * Creates a ParseError with the given message and optional source.
 * @param message - Error description.
 * @param source - The data source that failed to parse.
 * @returns A ParseError object.
 */
export const createParseError = (message = 'Fout bij het verwerken van de gegevens.', source?: string): ParseError => {
  return { type: 'ParseError', message, source };
};

const ERROR_CONFIG: Record<AppError['type'], { icon: string; title: string }> = {
  NotFoundError: { icon: '🔍', title: 'Niet gevonden' },
  NetworkError: { icon: '🌐', title: 'Verbindingsfout' },
  ApiError: { icon: '⚠️', title: 'API-fout' },
  RateLimitError: { icon: '⏳', title: 'Limiet bereikt' },
  EmptyResponseError: { icon: '📭', title: 'Leeg antwoord' },
  ParseError: { icon: '⚙️', title: 'Verwerkingsfout' },
};

/**
 * Returns the display icon and title for a given AppError.
 * @param error - The application error.
 * @returns An object with icon and title strings.
 */
export const getErrorDisplay = (error: AppError) => {
  return ERROR_CONFIG[error.type];
};

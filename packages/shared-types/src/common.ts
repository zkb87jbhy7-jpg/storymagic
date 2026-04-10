// ─── Common / Shared Types ─── used across all API endpoints

export type Locale = 'he' | 'en' | 'ar' | 'ru' | 'fr' | 'es' | 'de';

export type Currency = 'ILS' | 'USD' | 'EUR';

/** Standard paginated API response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/** Standard API error response (Chapter 13.3 Error Recovery UX) */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    retryable: boolean;
    retry_after_seconds?: number;
  };
}

/**
 * Server-Sent Events progress update during book generation.
 * The BFF provides SSE streams (Chapter 4.3) for real-time progress.
 * 12 phases from 0% to 100%.
 */
export interface SSEProgressEvent {
  event_type:
    | 'progress'
    | 'phase_change'
    | 'page_complete'
    | 'early_peek'
    | 'error'
    | 'complete';
  phase: number;
  phase_name: string;
  progress_percent: number;
  message: string;
  data?: Record<string, unknown>;
  /** URL to a preview image, e.g. the cover during early peek */
  preview_url?: string;
  timestamp: string;
}

/** Error type codes from Chapter 13.3 */
export type ErrorType =
  | 'NetworkError'
  | 'AIGenerationError'
  | 'PaymentError'
  | 'StorageError'
  | 'ValidationError'
  | 'RateLimitError';

/** API pagination query parameters */
export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ─── Analytics Types ─── matches DB table: analytics_events (Chapter 7.2)
// and Chapter 12.5 Analytics Events

export interface AnalyticsEvent {
  id: string;
  event_name: string;
  user_id: string | null;
  session_id: string | null;
  properties: Record<string, unknown> | null;
  locale: string | null;
  device_type: string | null;
  page_url: string | null;
  timestamp: string;
}

/**
 * Implicit signals tracked for the recommendation engine (Chapter 12.5):
 * - time_per_page: interest indicator
 * - pages_reread: favorite indicator
 * - illustrations_tapped: curiosity indicator
 * - book_completed: engagement indicator
 * - reread_count: love indicator
 */
export interface ImplicitSignal {
  user_id: string;
  book_id: string;
  signal_type:
    | 'time_per_page'
    | 'pages_reread'
    | 'illustrations_tapped'
    | 'book_completed'
    | 'book_abandoned'
    | 'reread_count';
  value: number;
  page_number?: number;
  timestamp: string;
}

/** Aggregated reading statistics for a child / book */
export interface ReadingStats {
  book_id: string;
  child_id: string;
  total_reading_time_seconds: number;
  pages_read: number;
  total_pages: number;
  completion_rate: number;
  average_time_per_page_seconds: number;
  favorite_pages: number[];
  interactive_elements_tapped: number;
  reading_buddy_questions_answered: number;
  reread_count: number;
  last_read_at: string;
}

// ---------------------------------------------------------------------------
// Error type definitions for StoryMagic
// Each error carries an isRetryable flag for automatic retry logic
// ---------------------------------------------------------------------------

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface AppErrorOptions {
  message: string
  code: string
  isRetryable: boolean
  severity: ErrorSeverity
  cause?: unknown
  meta?: Record<string, unknown>
}

export class AppError extends Error {
  readonly code: string
  readonly isRetryable: boolean
  readonly severity: ErrorSeverity
  readonly meta: Record<string, unknown>

  constructor(opts: AppErrorOptions) {
    super(opts.message)
    this.name = 'AppError'
    this.code = opts.code
    this.isRetryable = opts.isRetryable
    this.severity = opts.severity
    this.meta = opts.meta ?? {}
    if (opts.cause) this.cause = opts.cause
  }
}

// ---- Concrete error types ------------------------------------------------

export class NetworkError extends AppError {
  constructor(message = 'Network request failed', cause?: unknown) {
    super({
      message,
      code: 'NETWORK_ERROR',
      isRetryable: true,
      severity: 'medium',
      cause,
    })
    this.name = 'NetworkError'
  }
}

export class AIGenerationError extends AppError {
  constructor(
    message = 'AI generation failed',
    opts?: { isRetryable?: boolean; cause?: unknown },
  ) {
    super({
      message,
      code: 'AI_GENERATION_ERROR',
      isRetryable: opts?.isRetryable ?? true,
      severity: 'high',
      cause: opts?.cause,
    })
    this.name = 'AIGenerationError'
  }
}

export class PaymentError extends AppError {
  constructor(message = 'Payment processing failed', cause?: unknown) {
    super({
      message,
      code: 'PAYMENT_ERROR',
      isRetryable: false,
      severity: 'critical',
      cause,
    })
    this.name = 'PaymentError'
  }
}

export class StorageError extends AppError {
  constructor(message = 'Storage operation failed', cause?: unknown) {
    super({
      message,
      code: 'STORAGE_ERROR',
      isRetryable: true,
      severity: 'medium',
      cause,
    })
    this.name = 'StorageError'
  }
}

export class ValidationError extends AppError {
  readonly fields: Record<string, string>

  constructor(
    message = 'Validation failed',
    fields: Record<string, string> = {},
  ) {
    super({
      message,
      code: 'VALIDATION_ERROR',
      isRetryable: false,
      severity: 'low',
      meta: { fields },
    })
    this.name = 'ValidationError'
    this.fields = fields
  }
}

export class RateLimitError extends AppError {
  readonly retryAfterMs: number

  constructor(retryAfterMs = 60_000, cause?: unknown) {
    super({
      message: 'Rate limit exceeded',
      code: 'RATE_LIMIT_ERROR',
      isRetryable: true,
      severity: 'medium',
      cause,
      meta: { retryAfterMs },
    })
    this.name = 'RateLimitError'
    this.retryAfterMs = retryAfterMs
  }
}

// ---- Helper to determine error type from unknown -------------------------

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return new NetworkError(err.message, err)
  }
  return new AppError({
    message: err instanceof Error ? err.message : String(err),
    code: 'UNKNOWN_ERROR',
    isRetryable: false,
    severity: 'medium',
    cause: err,
  })
}

export type AppErrorType =
  | NetworkError
  | AIGenerationError
  | PaymentError
  | StorageError
  | ValidationError
  | RateLimitError

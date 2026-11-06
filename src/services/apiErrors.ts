/**
 * Normalized error type for everything that can go wrong when talking to the
 * SorobanLens backend. UI code should only ever deal with `ApiError` — never
 * with raw `fetch` exceptions or unvalidated response bodies.
 */

export type ApiErrorKind =
  /** The backend answered with a non-2xx status. */
  | 'http'
  /** The request never reached the backend (offline, DNS, CORS, refused). */
  | 'network'
  /** The request exceeded the client-side timeout. */
  | 'timeout'
  /** The backend answered 2xx but the body did not match the API contract. */
  | 'invalid_response'
  /** The request was cancelled by the caller (e.g. component unmounted). */
  | 'aborted'

export interface ApiErrorInit {
  kind: ApiErrorKind
  message: string
  status?: number
  code?: string
  requestId?: string | null
  retryAfterSeconds?: number | null
  cause?: unknown
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  /** Machine-readable backend error code (e.g. `invalid_transaction_hash`). */
  readonly code?: string
  readonly requestId?: string | null
  readonly retryAfterSeconds?: number | null

  constructor(init: ApiErrorInit) {
    super(init.message, { cause: init.cause })
    this.name = 'ApiError'
    this.kind = init.kind
    this.status = init.status
    this.code = init.code
    this.requestId = init.requestId
    this.retryAfterSeconds = init.retryAfterSeconds
  }

  /** Whether retrying the same request might succeed. */
  get isRetryable(): boolean {
    if (this.kind === 'network' || this.kind === 'timeout') return true
    if (this.kind !== 'http' || this.status === undefined) return false
    return this.status === 429 || this.status === 502 || this.status === 503 || this.status === 504
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError
}

/**
 * Turns any error into a short, user-facing message. Backend messages are
 * shown for 4xx responses (they describe the user's input); for 5xx we show a
 * generic message so internal details are never surfaced verbatim.
 */
export function describeError(error: unknown): { title: string; detail: string } {
  if (!isApiError(error)) {
    return { title: 'Unexpected error', detail: 'Something went wrong. Please try again.' }
  }
  switch (error.kind) {
    case 'network':
      return {
        title: 'Backend unreachable',
        detail:
          'Could not connect to the SorobanLens API. Check that the backend is running and that the API base URL in Settings is correct.',
      }
    case 'timeout':
      return {
        title: 'Request timed out',
        detail: 'The backend did not respond in time. Stellar RPC may be slow — try again shortly.',
      }
    case 'invalid_response':
      return {
        title: 'Unexpected response',
        detail:
          'The backend returned data this version of the frontend does not understand. The frontend and backend versions may be out of sync.',
      }
    case 'aborted':
      return { title: 'Request cancelled', detail: 'The request was cancelled.' }
    case 'http':
      break
  }

  switch (error.code) {
    case 'invalid_transaction_hash':
      return { title: 'Invalid transaction hash', detail: error.message }
    case 'not_found':
      return { title: 'Not found', detail: error.message }
    case 'persistence_disabled':
      return {
        title: 'Analysis history unavailable',
        detail: 'This backend does not store analyses, so past reports cannot be retrieved by ID.',
      }
    case 'rate_limited': {
      const wait = error.retryAfterSeconds ? ` Try again in ${error.retryAfterSeconds}s.` : ''
      return { title: 'Too many requests', detail: `Rate limit reached.${wait}` }
    }
    case 'rpc_unavailable':
    case 'rpc_timeout':
      return {
        title: 'Stellar RPC unavailable',
        detail:
          'The backend could not reach its Stellar RPC endpoint. No diagnosis was produced — try again later.',
      }
  }

  if (error.status !== undefined && error.status >= 500) {
    return {
      title: 'Server error',
      detail: `The backend failed to process the request (HTTP ${error.status}).${
        error.requestId ? ` Reference: ${error.requestId}` : ''
      }`,
    }
  }
  return { title: 'Request rejected', detail: error.message }
}

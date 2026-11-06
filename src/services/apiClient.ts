/**
 * Centralized client for the SorobanLens REST API (v1).
 *
 * - All requests go through `request()`, which applies the timeout, parses the
 *   standard error envelope and validates successful bodies with zod.
 * - The client is a plain object created by `createApiClient`, so it can be
 *   instantiated with a custom `fetch` in tests and re-created when the user
 *   changes the API base URL in Settings.
 */
import type { z } from 'zod'
import {
  apiErrorBodySchema,
  apiInfoSchema,
  diagnosticReportSchema,
  healthResponseSchema,
  type ApiInfo,
  type DiagnosticReport,
  type HealthResponse,
  type TransactionRequest,
} from '../types/api'
import { ApiError } from './apiErrors'

export interface ApiClientOptions {
  /** Base URL without trailing slash. Empty string = same origin. */
  baseUrl: string
  timeoutMs: number
  fetch?: typeof fetch
}

export interface RequestOptions {
  signal?: AbortSignal
}

export interface ApiClient {
  readonly baseUrl: string
  health(options?: RequestOptions): Promise<HealthResponse>
  info(options?: RequestOptions): Promise<ApiInfo>
  analyze(request: TransactionRequest, options?: RequestOptions): Promise<DiagnosticReport>
  getAnalysis(id: string, options?: RequestOptions): Promise<DiagnosticReport>
}

export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null
  const seconds = Number(header)
  return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds) : null
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const baseUrl = normalizeBaseUrl(options.baseUrl)
  const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis)

  async function request<S extends z.ZodType>(
    path: string,
    schema: S,
    init: RequestInit & RequestOptions = {},
  ): Promise<z.infer<S>> {
    const controller = new AbortController()
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, options.timeoutMs)
    const onCallerAbort = () => controller.abort()
    init.signal?.addEventListener('abort', onCallerAbort, { once: true })

    let response: Response
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: { Accept: 'application/json', ...init.headers },
      })
    } catch (cause) {
      if (timedOut) {
        throw new ApiError({ kind: 'timeout', message: `Request timed out after ${options.timeoutMs}ms`, cause })
      }
      if (init.signal?.aborted) {
        throw new ApiError({ kind: 'aborted', message: 'Request aborted', cause })
      }
      throw new ApiError({ kind: 'network', message: 'Network request failed', cause })
    } finally {
      clearTimeout(timer)
      init.signal?.removeEventListener('abort', onCallerAbort)
    }

    let body: unknown = undefined
    const text = await response.text().catch(() => '')
    if (text) {
      try {
        body = JSON.parse(text)
      } catch {
        body = undefined
      }
    }

    if (!response.ok) {
      const envelope = apiErrorBodySchema.safeParse(body)
      throw new ApiError({
        kind: 'http',
        status: response.status,
        code: envelope.success ? envelope.data.error.code : undefined,
        message: envelope.success
          ? envelope.data.error.message
          : `Request failed with HTTP ${response.status}`,
        requestId: envelope.success ? envelope.data.error.request_id : null,
        retryAfterSeconds: parseRetryAfter(response.headers.get('Retry-After')),
      })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError({
        kind: 'invalid_response',
        status: response.status,
        message: `Response from ${path} did not match the expected format`,
        cause: parsed.error,
      })
    }
    return parsed.data
  }

  return {
    baseUrl,
    health: (opts) => request('/health', healthResponseSchema, opts),
    info: (opts) => request('/api/v1', apiInfoSchema, opts),
    analyze: (body, opts) =>
      request('/api/v1/analyze', diagnosticReportSchema, {
        ...opts,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    getAnalysis: (id, opts) =>
      request(`/api/v1/analyze/${encodeURIComponent(id)}`, diagnosticReportSchema, opts),
  }
}

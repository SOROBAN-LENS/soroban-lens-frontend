import { describe, expect, it, vi } from 'vitest'
import { sampleReport } from '../fixtures/sampleReport'
import { createApiClient } from './apiClient'
import { ApiError, describeError } from './apiErrors'

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } })
}

function client(fetchImpl: typeof fetch, timeoutMs = 5000) {
  return createApiClient({ baseUrl: 'http://api.test/', timeoutMs, fetch: fetchImpl })
}

const request = { transaction_hash: 'a'.repeat(64), network: 'testnet' } as const

describe('apiClient', () => {
  it('POSTs analyze requests and returns a validated report', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(sampleReport))
    const report = await client(fetchMock).analyze(request)
    expect(report.id).toBe(sampleReport.id)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://api.test/api/v1/analyze')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual(request)
  })

  it('falls back safely on unknown enum values from a newer backend', async () => {
    const body = { ...sampleReport, issues: [{ ...sampleReport.issues[0], category: 'brand_new', evidence: 'weird' }] }
    const report = await client(vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(body))).analyze(request)
    expect(report.issues[0].category).toBe('unknown')
    expect(report.issues[0].evidence).toBe('insufficient_data')
  })

  it('parses the error envelope and Retry-After', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({ error: { code: 'rate_limited', message: 'slow down', request_id: 'r1' } }, 429, { 'Retry-After': '7' }),
    )
    const error = await client(fetchMock).analyze(request).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ kind: 'http', status: 429, code: 'rate_limited', requestId: 'r1', retryAfterSeconds: 7 })
    expect((error as ApiError).isRetryable).toBe(true)
    expect(describeError(error).detail).toContain('7s')
  })

  it('does not leak 5xx messages to the user', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({ error: { code: 'internal_error', message: 'db password wrong at line 3', request_id: 'abc' } }, 500),
    )
    const error = await client(fetchMock).analyze(request).catch((e: unknown) => e)
    const { detail } = describeError(error)
    expect(detail).not.toContain('password')
    expect(detail).toContain('abc')
  })

  it('reports invalid response bodies', async () => {
    const error = await client(vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ nope: true })))
      .analyze(request)
      .catch((e: unknown) => e)
    expect(error).toMatchObject({ kind: 'invalid_response' })
  })

  it('maps fetch failures to network errors', async () => {
    const error = await client(vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch')))
      .health()
      .catch((e: unknown) => e)
    expect(error).toMatchObject({ kind: 'network' })
    expect(describeError(error).title).toBe('Backend unreachable')
  })

  it('times out slow requests', async () => {
    const hang: typeof fetch = (_url, init) =>
      new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted'))))
    const error = await client(hang, 20).health().catch((e: unknown) => e)
    expect(error).toMatchObject({ kind: 'timeout' })
  })

  it('encodes report IDs in the path', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(sampleReport))
    await client(fetchMock).getAnalysis('a/b')
    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/v1/analyze/a%2Fb')
  })
})

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { sampleReport } from '../fixtures/sampleReport'
import { historyStore } from '../services/historyStore'
import { renderRoute } from '../test/render'

function mockFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => Promise.resolve(handler(String(input), init)))
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const health = () => json({ status: 'ok', version: '0.1.0' })

describe('pages', () => {
  it('renders the landing page', () => {
    renderRoute('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/failures understandable/i)
    expect(screen.getByRole('heading', { name: /how it works/i })).toBeInTheDocument()
  })

  it('labels dashboard demo data when there is no history', async () => {
    historyStore.set([])
    mockFetch(health)
    renderRoute('/app')
    expect(screen.getByText(/demo data/i)).toBeInTheDocument()
    expect(screen.getByText(/not real network data/i)).toBeInTheDocument()
  })

  it('analyzes a transaction end-to-end and shows the report', async () => {
    historyStore.set([])
    const report = { ...sampleReport, id: 'rep-1' }
    mockFetch((url, init) => (url.endsWith('/api/v1/analyze') && init?.method === 'POST' ? json(report) : health()))
    renderRoute('/app/analyze')
    await userEvent.type(screen.getByLabelText(/transaction hash/i), 'a'.repeat(64))
    await userEvent.click(screen.getByRole('button', { name: /analyze transaction/i }))
    expect(await screen.findByRole('heading', { name: /diagnostic report/i })).toBeInTheDocument()
    expect(screen.getByText('Missing or mismatched authorization')).toBeInTheDocument()
    expect(historyStore.get()[0].report.id).toBe('rep-1')
  })

  it('shows a friendly error when the backend is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    renderRoute('/app/analyze')
    await userEvent.type(screen.getByLabelText(/transaction hash/i), 'b'.repeat(64))
    await userEvent.click(screen.getByRole('button', { name: /analyze transaction/i }))
    expect(await screen.findByText('Backend unreachable')).toBeInTheDocument()
  })

  it('renders the sample report without calling the analyze API', () => {
    const spy = mockFetch(health)
    renderRoute('/app/reports/sample')
    expect(screen.getByText(/this is not a real analysis/i)).toBeInTheDocument()
    expect(spy.mock.calls.some(([u]) => String(u).includes('/analyze'))).toBe(false)
  })

  it('renders the docs page', () => {
    mockFetch(health)
    renderRoute('/app/docs')
    expect(screen.getByRole('heading', { name: /api endpoints/i })).toBeInTheDocument()
  })

  it('validates the API base URL in settings', async () => {
    mockFetch(health)
    renderRoute('/app/settings')
    const input = screen.getByLabelText(/api base url/i)
    await userEvent.type(input, 'ftp://bad')
    await userEvent.click(screen.getByRole('button', { name: /save connection/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/http/)
  })

  it('shows not found for unknown routes', () => {
    renderRoute('/nope')
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
  })
})

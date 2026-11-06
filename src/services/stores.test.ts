import { describe, expect, it } from 'vitest'
import { sampleReport } from '../fixtures/sampleReport'
import { diagnosticReportSchema } from '../types/api'
import { addToHistory, computeHistoryStats, HISTORY_LIMIT, historyStore, parseHistory } from './historyStore'
import { parseSettings } from './settingsStore'

describe('sample fixture', () => {
  it('matches the API contract schema', () => {
    expect(diagnosticReportSchema.safeParse(sampleReport).success).toBe(true)
  })
})

describe('historyStore', () => {
  it('dedupes by id, caps size and computes stats', () => {
    historyStore.set([])
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) addToHistory({ ...sampleReport, id: `r${i}` })
    addToHistory({ ...sampleReport, id: 'r30' })
    const entries = historyStore.get()
    expect(entries).toHaveLength(HISTORY_LIMIT)
    expect(entries[0].report.id).toBe('r30')
    expect(new Set(entries.map((e) => e.report.id)).size).toBe(HISTORY_LIMIT)
    expect(computeHistoryStats(entries)).toMatchObject({ total: HISTORY_LIMIT, failedTransactions: HISTORY_LIMIT })
  })

  it('drops corrupt entries instead of failing', () => {
    expect(parseHistory([{ junk: 1 }, { report: sampleReport, savedAt: 'x' }])).toHaveLength(1)
    expect(parseHistory('nope')).toEqual([])
  })
})

describe('parseSettings', () => {
  it('replaces invalid stored values with defaults', () => {
    const s = parseSettings({ theme: 'neon', requestTimeoutMs: 1, defaultNetwork: 'mainnet' })
    expect(s.theme).toBe('dark')
    expect(s.requestTimeoutMs).toBeGreaterThanOrEqual(5000)
    expect(s.defaultNetwork).toBe('mainnet')
  })
})

import { z } from 'zod'
import { diagnosticReportSchema, type DiagnosticReport } from '../types/api'
import { createPersistentStore } from './persistentStore'

/**
 * Local analysis history. Reports returned by the backend are kept in this
 * browser so they can be reopened even when the backend has no persistence.
 * Nothing here is sent anywhere.
 */
export const HISTORY_STORAGE_KEY = 'sorobanlens.history.v1'
export const HISTORY_LIMIT = 25

export interface HistoryEntry {
  report: DiagnosticReport
  savedAt: string
}

const entrySchema = z.object({ report: diagnosticReportSchema, savedAt: z.string() })

/** Drops corrupt/out-of-date entries instead of failing the whole history. */
export function parseHistory(raw: unknown): HistoryEntry[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    const parsed = entrySchema.safeParse(item)
    return parsed.success ? [parsed.data] : []
  })
}

export const historyStore = createPersistentStore<HistoryEntry[]>(
  HISTORY_STORAGE_KEY,
  () => [],
  parseHistory,
)

export function addToHistory(report: DiagnosticReport, now: Date = new Date()): void {
  historyStore.set((prev) =>
    [{ report, savedAt: now.toISOString() }, ...prev.filter((e) => e.report.id !== report.id)].slice(
      0,
      HISTORY_LIMIT,
    ),
  )
}

export function findInHistory(id: string): DiagnosticReport | undefined {
  return historyStore.get().find((entry) => entry.report.id === id)?.report
}

export function clearHistory(): void {
  historyStore.set([])
}

export interface HistoryStats {
  total: number
  failedTransactions: number
  successfulTransactions: number
  completedAnalyses: number
  notFound: number
}

export function computeHistoryStats(entries: HistoryEntry[]): HistoryStats {
  const stats: HistoryStats = {
    total: entries.length,
    failedTransactions: 0,
    successfulTransactions: 0,
    completedAnalyses: 0,
    notFound: 0,
  }
  for (const { report } of entries) {
    if (report.status === 'completed') stats.completedAnalyses += 1
    switch (report.transaction?.status) {
      case 'failed':
        stats.failedTransactions += 1
        break
      case 'success':
        stats.successfulTransactions += 1
        break
      case 'not_found':
        stats.notFound += 1
        break
    }
  }
  return stats
}

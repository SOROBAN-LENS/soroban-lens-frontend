import type { StellarNetwork } from '../types/api'

/** `abcdef…123456` style shortening for hashes and contract IDs. */
export function truncateMiddle(value: string, head = 8, tail = 8): string {
  if (value.length <= head + tail + 1) return value
  return `${value.slice(0, head)}…${value.slice(-tail)}`
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000)
  if (Number.isNaN(diffSeconds)) return iso
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const abs = Math.abs(diffSeconds)
  if (abs < 60) return rtf.format(diffSeconds, 'second')
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), 'minute')
  if (abs < 86_400) return rtf.format(Math.round(diffSeconds / 3600), 'hour')
  return rtf.format(Math.round(diffSeconds / 86_400), 'day')
}

/** Formats a stroop amount (string, to keep i64 precision) as XLM. */
export function formatStroops(stroops: string | null | undefined): string {
  if (stroops === null || stroops === undefined || !/^-?\d+$/.test(stroops)) return '—'
  const negative = stroops.startsWith('-')
  const digits = (negative ? stroops.slice(1) : stroops).padStart(8, '0')
  const whole = digits.slice(0, -7) || '0'
  const fraction = digits.slice(-7).replace(/0+$/, '')
  const xlm = fraction ? `${whole}.${fraction}` : whole
  return `${negative ? '-' : ''}${xlm} XLM (${Number(stroops).toLocaleString()} stroops)`
}

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : value.toLocaleString()
}

/** Public block explorer link (stellar.expert) for a transaction. */
export function explorerTxUrl(network: string, hash: string): string | null {
  const segment: Record<StellarNetwork, string> = { testnet: 'testnet', mainnet: 'public' }
  const path = segment[network as StellarNetwork]
  return path ? `https://stellar.expert/explorer/${path}/tx/${hash}` : null
}

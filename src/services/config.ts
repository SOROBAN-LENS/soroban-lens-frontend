import { NETWORKS, type StellarNetwork } from '../types/api'

/** Build-time configuration from `VITE_*` environment variables (see .env.example). */
function readNetwork(value: string | undefined): StellarNetwork {
  return (NETWORKS as readonly string[]).includes(value ?? '') ? (value as StellarNetwork) : 'testnet'
}

function readTimeout(value: string | undefined): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 1000 ? parsed : 30_000
}

export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').trim(),
  defaultNetwork: readNetwork(import.meta.env.VITE_DEFAULT_NETWORK),
  requestTimeoutMs: readTimeout(import.meta.env.VITE_REQUEST_TIMEOUT_MS),
} as const

export const APP_VERSION = '0.1.0'

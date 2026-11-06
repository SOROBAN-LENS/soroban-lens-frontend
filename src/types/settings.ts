import type { StellarNetwork } from './api'

export type ThemePreference = 'dark' | 'light'

export interface AppSettings {
  /** Overrides VITE_API_BASE_URL when non-empty. */
  apiBaseUrl: string
  defaultNetwork: StellarNetwork
  requestTimeoutMs: number
  theme: ThemePreference
  /** Keep completed reports in this browser's localStorage. */
  saveHistory: boolean
}

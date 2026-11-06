import { z } from 'zod'
import { networkSchema } from '../types/api'
import type { AppSettings } from '../types/settings'
import { env } from './config'
import { createPersistentStore } from './persistentStore'

export const SETTINGS_STORAGE_KEY = 'sorobanlens.settings.v1'

export const MIN_TIMEOUT_MS = 5_000
export const MAX_TIMEOUT_MS = 120_000

export function defaultSettings(): AppSettings {
  return {
    apiBaseUrl: '',
    defaultNetwork: env.defaultNetwork,
    requestTimeoutMs: env.requestTimeoutMs,
    theme: 'dark',
    saveHistory: true,
  }
}

const storedSettingsSchema = z.object({
  apiBaseUrl: z.string().catch(''),
  defaultNetwork: networkSchema.catch(env.defaultNetwork),
  requestTimeoutMs: z.number().min(MIN_TIMEOUT_MS).max(MAX_TIMEOUT_MS).catch(env.requestTimeoutMs),
  theme: z.enum(['dark', 'light']).catch('dark'),
  saveHistory: z.boolean().catch(true),
})

export function parseSettings(raw: unknown): AppSettings {
  const result = storedSettingsSchema.partial().safeParse(raw)
  return { ...defaultSettings(), ...(result.success ? result.data : {}) }
}

export const settingsStore = createPersistentStore<AppSettings>(
  SETTINGS_STORAGE_KEY,
  defaultSettings,
  parseSettings,
)

/** Effective API base URL: user override first, then build-time env, then same origin. */
export function resolveApiBaseUrl(settings: AppSettings): string {
  return settings.apiBaseUrl.trim() || env.apiBaseUrl
}

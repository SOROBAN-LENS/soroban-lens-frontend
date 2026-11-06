import { useMemo } from 'react'
import { createApiClient, type ApiClient } from '../services/apiClient'
import { resolveApiBaseUrl } from '../services/settingsStore'
import { useSettings } from './useSettings'

/** Returns an API client bound to the current base URL / timeout settings. */
export function useApiClient(): ApiClient {
  const { settings } = useSettings()
  const baseUrl = resolveApiBaseUrl(settings)
  const timeoutMs = settings.requestTimeoutMs
  return useMemo(() => createApiClient({ baseUrl, timeoutMs }), [baseUrl, timeoutMs])
}

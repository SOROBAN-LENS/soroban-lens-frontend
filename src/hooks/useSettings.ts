import { useCallback, useSyncExternalStore } from 'react'
import { settingsStore } from '../services/settingsStore'
import type { AppSettings } from '../types/settings'

export function useSettings() {
  const settings = useSyncExternalStore(settingsStore.subscribe, settingsStore.get, settingsStore.get)
  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    settingsStore.set((prev) => ({ ...prev, ...patch }))
  }, [])
  return { settings, updateSettings }
}

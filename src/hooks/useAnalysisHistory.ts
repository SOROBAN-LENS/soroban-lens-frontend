import { useSyncExternalStore } from 'react'
import { historyStore } from '../services/historyStore'

export function useAnalysisHistory() {
  return useSyncExternalStore(historyStore.subscribe, historyStore.get, historyStore.get)
}

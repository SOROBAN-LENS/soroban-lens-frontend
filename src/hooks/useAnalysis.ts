import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isApiError, type ApiError } from '../services/apiErrors'
import { addToHistory, findInHistory } from '../services/historyStore'
import { settingsStore } from '../services/settingsStore'
import type { DiagnosticReport, TransactionRequest } from '../types/api'
import { useApiClient } from './useApiClient'
import { queryKeys } from './queryKeys'

/** POST /api/v1/analyze. Successful reports are cached and (optionally) saved locally. */
export function useAnalyzeTransaction() {
  const client = useApiClient()
  const queryClient = useQueryClient()
  return useMutation<DiagnosticReport, ApiError, TransactionRequest>({
    mutationFn: (request) => client.analyze(request),
    onSuccess: (report) => {
      queryClient.setQueryData(queryKeys.analysis(report.id), report)
      if (settingsStore.get().saveHistory) addToHistory(report)
    },
  })
}

/**
 * Loads a report by ID. Resolution order: in-memory query cache → this
 * browser's local history → GET /api/v1/analyze/:id on the backend.
 */
export function useAnalysis(id: string) {
  const client = useApiClient()
  return useQuery<DiagnosticReport, ApiError>({
    queryKey: queryKeys.analysis(id),
    queryFn: ({ signal }) => client.getAnalysis(id, { signal }),
    initialData: () => findInHistory(id),
    staleTime: Infinity,
    retry: (failureCount, error) => isApiError(error) && error.isRetryable && failureCount < 2,
  })
}

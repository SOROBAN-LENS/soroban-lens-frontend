import { useQuery } from '@tanstack/react-query'
import { useApiClient } from './useApiClient'
import { queryKeys } from './queryKeys'

/** Polls GET /health so the UI can show whether the backend is reachable. */
export function useBackendHealth() {
  const client = useApiClient()
  return useQuery({
    queryKey: queryKeys.health(client.baseUrl),
    queryFn: ({ signal }) => client.health({ signal }),
    refetchInterval: 30_000,
    retry: false,
    staleTime: 10_000,
  })
}

/** GET /api/v1 — version and capabilities (e.g. whether persistence is enabled). */
export function useApiInfo() {
  const client = useApiClient()
  return useQuery({
    queryKey: queryKeys.apiInfo(client.baseUrl),
    queryFn: ({ signal }) => client.info({ signal }),
    retry: false,
    staleTime: 60_000,
  })
}

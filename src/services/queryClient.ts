import { QueryClient } from '@tanstack/react-query'
import { isApiError } from './apiErrors'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        // Only retry failures that can plausibly succeed on retry (network, 429, 5xx gateway).
        retry: (failureCount, error) => isApiError(error) && error.isRetryable && failureCount < 2,
      },
      mutations: { retry: false },
    },
  })
}

import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { RouterProvider } from 'react-router'
import { useApplyTheme } from './hooks/useApplyTheme'
import { createAppRouter } from './routes/router'
import { createQueryClient } from './services/queryClient'

export function App() {
  const [queryClient] = useState(createQueryClient)
  const [router] = useState(() => createAppRouter())
  useApplyTheme()
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

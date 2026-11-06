import { TriangleAlert } from 'lucide-react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { buttonClasses } from '../components/ui/buttonClasses'
import { EmptyState } from '../components/ui/EmptyState'
import { paths } from '../routes/paths'

/** Last-resort boundary for render errors. Never prints stack traces to users. */
export function RouteErrorPage() {
  const error = useRouteError()
  if (import.meta.env.DEV) console.error(error)
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'An unexpected error occurred while rendering this page.'
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        action={
          <Link to={paths.home} reloadDocument className={buttonClasses('secondary', 'sm')}>
            Reload SorobanLens
          </Link>
        }
      >
        {message}
      </EmptyState>
    </div>
  )
}

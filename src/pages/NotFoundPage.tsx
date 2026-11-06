import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import { buttonClasses } from '../components/ui/buttonClasses'
import { EmptyState } from '../components/ui/EmptyState'
import { paths } from '../routes/paths'

export function NotFoundPage({ standalone }: { standalone?: boolean }) {
  return (
    <div className={standalone ? 'flex min-h-dvh items-center justify-center' : undefined}>
      <EmptyState
        icon={Compass}
        title="Page not found"
        action={
          <Link to={standalone ? paths.home : paths.dashboard} className={buttonClasses('secondary', 'sm')}>
            {standalone ? 'Go home' : 'Back to dashboard'}
          </Link>
        }
      >
        The page you are looking for does not exist.
      </EmptyState>
    </div>
  )
}

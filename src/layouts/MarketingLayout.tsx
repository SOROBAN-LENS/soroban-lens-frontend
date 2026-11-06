import { Link, Outlet, ScrollRestoration } from 'react-router'
import { Logo } from '../components/brand/Logo'
import { buttonClasses } from '../components/ui/buttonClasses'
import { paths } from '../routes/paths'

export function MarketingLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to={paths.home} aria-label="SorobanLens home">
            <Logo />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-5 text-sm text-muted sm:flex">
            <a href="#how-it-works" className="hover:text-fg">
              How it works
            </a>
            <a href="#capabilities" className="hover:text-fg">
              Capabilities
            </a>
            <Link to={paths.docs} className="hover:text-fg">
              Docs
            </Link>
          </nav>
          <Link to={paths.dashboard} className={buttonClasses('secondary', 'sm', 'ml-auto')}>
            Open app
          </Link>
        </div>
      </header>
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-subtle sm:px-6">
          <p>SorobanLens — open-source diagnostics for Soroban smart contracts. MIT licensed.</p>
          <p>Early development. Not affiliated with the Stellar Development Foundation.</p>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}

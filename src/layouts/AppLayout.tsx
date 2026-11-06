import { BookOpen, LayoutDashboard, Menu, ScanSearch, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { Logo } from '../components/brand/Logo'
import { BackendStatus } from '../components/system/BackendStatus'
import { Badge } from '../components/ui/Badge'
import { useSettings } from '../hooks/useSettings'
import { paths } from '../routes/paths'
import { APP_VERSION } from '../services/config'
import { cn } from '../utils/cn'
import { networkLabel } from '../utils/labels'

const nav = [
  { to: paths.dashboard, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: paths.analyze, label: 'Analyze transaction', icon: ScanSearch, end: false },
  { to: paths.docs, label: 'Documentation', icon: BookOpen, end: false },
  { to: paths.settings, label: 'Settings', icon: Settings, end: false },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="space-y-0.5">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-surface-3 text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
              )
            }
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export function AppLayout() {
  const { settings } = useSettings()
  const location = useLocation()
  // The drawer is tied to the path it was opened on, so any navigation
  // (including back/forward) closes it without an effect.
  const [openedOn, setOpenedOn] = useState<string | null>(null)
  const mobileOpen = openedOn === location.pathname
  const setMobileOpen = (open: boolean) => setOpenedOn(open ? location.pathname : null)

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link to={paths.home} aria-label="SorobanLens home">
            <Logo />
          </Link>
        </div>
        <nav aria-label="Main" className="flex-1 overflow-y-auto p-3">
          <NavItems />
        </nav>
        <div className="space-y-1 border-t border-border p-4 text-xs text-subtle">
          <p>Frontend v{APP_VERSION}</p>
          <p>Early development — not production-ready.</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            aria-label="Main"
            className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-surface"
          >
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <Logo />
              <button
                type="button"
                aria-label="Close menu"
                className="rounded-md p-1.5 text-muted hover:bg-surface-2"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="p-3">
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </div>
          </nav>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <Link to={paths.home} className="lg:hidden" aria-label="SorobanLens home">
            <Logo />
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <BackendStatus className="hidden sm:inline-flex" />
            <Badge tone="info" title="Default network for new analyses (change in Settings)">
              {networkLabel(settings.defaultNetwork)}
            </Badge>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}

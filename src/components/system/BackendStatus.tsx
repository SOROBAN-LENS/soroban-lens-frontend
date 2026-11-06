import { useBackendHealth } from '../../hooks/useBackendStatus'
import { cn } from '../../utils/cn'

/**
 * Live indicator of whether GET /health on the configured backend succeeds.
 * This reflects the SorobanLens API only — not the state of the Stellar network.
 */
export function BackendStatus({ className }: { className?: string }) {
  const health = useBackendHealth()

  let dot = 'bg-subtle'
  let label = 'Checking backend…'
  if (health.isSuccess) {
    const ok = health.data.status === 'ok'
    dot = ok ? 'bg-success' : 'bg-warning'
    label = ok ? `Backend online · v${health.data.version}` : `Backend degraded · v${health.data.version}`
  } else if (health.isError) {
    dot = 'bg-danger'
    label = 'Backend offline'
  }

  return (
    <span
      className={cn('inline-flex items-center gap-2 text-xs text-muted', className)}
      role="status"
      aria-live="polite"
      title="Result of GET /health on the configured SorobanLens API"
    >
      <span className={cn('size-2 rounded-full', dot)} aria-hidden />
      {label}
    </span>
  )
}

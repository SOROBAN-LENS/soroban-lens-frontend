import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning' | 'info'

const tones: Record<BadgeTone, string> = {
  neutral: 'border-border-strong bg-surface-2 text-muted',
  accent: 'border-accent/30 bg-accent-soft text-accent',
  success: 'border-success/30 bg-success-soft text-success',
  danger: 'border-danger/30 bg-danger-soft text-danger',
  warning: 'border-warning/30 bg-warning-soft text-warning',
  info: 'border-info/30 bg-info-soft text-info',
}

export function Badge({ tone = 'neutral', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}

/** Marks illustrative content. Required wherever demo or sample data is shown. */
export function DemoBadge({ label = 'Demo data' }: { label?: string }) {
  return (
    <Badge tone="warning" className="uppercase tracking-wide">
      {label}
    </Badge>
  )
}

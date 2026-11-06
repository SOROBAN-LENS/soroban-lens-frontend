import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Tone = 'info' | 'success' | 'warning' | 'danger'

const styles: Record<Tone, { box: string; icon: typeof Info }> = {
  info: { box: 'border-info/30 bg-info-soft text-info', icon: Info },
  success: { box: 'border-success/30 bg-success-soft text-success', icon: CircleCheck },
  warning: { box: 'border-warning/30 bg-warning-soft text-warning', icon: TriangleAlert },
  danger: { box: 'border-danger/30 bg-danger-soft text-danger', icon: CircleAlert },
}

export function Alert({
  tone = 'info',
  title,
  children,
  action,
  className,
}: {
  tone?: Tone
  title: ReactNode
  children?: ReactNode
  action?: ReactNode
  className?: string
}) {
  const { box, icon: Icon } = styles[tone]
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-lg border px-4 py-3', box, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        {children && <div className="mt-1 text-sm text-fg/80">{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  )
}

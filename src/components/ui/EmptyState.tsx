import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({ icon: Icon, title, children, action }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-border bg-surface-2">
        <Icon className="size-5 text-subtle" aria-hidden />
      </div>
      <p className="text-sm font-medium text-fg">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

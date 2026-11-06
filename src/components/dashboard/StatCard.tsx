import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '../ui/Card'

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string
  value: ReactNode
  icon: LucideIcon
  hint?: ReactNode
}) {
  return (
    <Card className="px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">{label}</p>
        <Icon className="size-4 text-subtle" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-fg tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </Card>
  )
}

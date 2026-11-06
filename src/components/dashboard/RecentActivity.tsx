import { History } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import type { HistoryEntry } from '../../services/historyStore'
import { formatRelativeTime, truncateMiddle } from '../../utils/format'
import { CATEGORY_META, networkLabel } from '../../utils/labels'
import { buttonClasses } from '../ui/buttonClasses'
import { EmptyState } from '../ui/EmptyState'
import { TransactionStatusBadge } from '../diagnostics/badges'

/** Most recent analyses stored in this browser. */
export function RecentActivity({ entries, limit = 8 }: { entries: HistoryEntry[]; limit?: number }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No analyses yet"
        action={
          <Link to={paths.sampleReport} className={buttonClasses('secondary', 'sm')}>
            View a sample report
          </Link>
        }
      >
        Reports you run are saved in this browser and appear here.
      </EmptyState>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {entries.slice(0, limit).map(({ report, savedAt }) => {
        const primary = report.issues[0]
        return (
          <li key={report.id}>
            <Link
              to={paths.report(report.id)}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 transition-colors hover:bg-surface-2"
            >
              <span className="font-mono text-[13px] text-fg">{truncateMiddle(report.transaction_hash, 10, 6)}</span>
              {report.transaction && <TransactionStatusBadge status={report.transaction.status} />}
              <span className="text-xs text-muted">
                {primary ? CATEGORY_META[primary.category].label : 'No issues'}
              </span>
              <span className="ml-auto text-xs text-subtle">
                {networkLabel(report.network)} · {formatRelativeTime(savedAt)}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

import type { AnalysisStatus, ErrorCategory, EvidenceLevel, Severity, TransactionStatus } from '../../types/api'
import {
  ANALYSIS_STATUS_META,
  CATEGORY_META,
  EVIDENCE_META,
  SEVERITY_META,
  TRANSACTION_STATUS_META,
} from '../../utils/labels'
import { Badge, type BadgeTone } from '../ui/Badge'

const txTone: Record<TransactionStatus, BadgeTone> = { success: 'success', failed: 'danger', not_found: 'neutral' }
const analysisTone: Record<AnalysisStatus, BadgeTone> = { pending: 'info', completed: 'accent', failed: 'warning' }
const severityTone: Record<Severity, BadgeTone> = {
  critical: 'danger',
  error: 'danger',
  warning: 'warning',
  info: 'info',
}
const evidenceTone: Record<EvidenceLevel, BadgeTone> = {
  confirmed: 'success',
  likely: 'info',
  possible: 'neutral',
  insufficient_data: 'warning',
}

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const meta = TRANSACTION_STATUS_META[status]
  return (
    <Badge tone={txTone[status]} title={meta.description}>
      {meta.label}
    </Badge>
  )
}

export function AnalysisStatusBadge({ status }: { status: AnalysisStatus }) {
  return <Badge tone={analysisTone[status]}>{ANALYSIS_STATUS_META[status].label}</Badge>
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge tone={severityTone[severity]}>{SEVERITY_META[severity].label}</Badge>
}

export function EvidenceBadge({ evidence }: { evidence: EvidenceLevel }) {
  const meta = EVIDENCE_META[evidence]
  return (
    <Badge tone={evidenceTone[evidence]} title={meta.description}>
      {meta.label}
    </Badge>
  )
}

export function CategoryBadge({ category }: { category: ErrorCategory }) {
  const meta = CATEGORY_META[category]
  return (
    <Badge tone="neutral" title={meta.description} className="font-mono">
      {meta.label}
    </Badge>
  )
}

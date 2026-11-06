import type { DiagnosticReport } from '../../types/api'
import { formatDateTime } from '../../utils/format'
import { Card, CardBody, CardHeader } from '../ui/Card'

function display(value: string | number | boolean | null): string {
  if (value === null) return 'null'
  return String(value)
}

/** Engine/version/timing information plus the free-form `metadata` map. */
export function MetadataTable({ report }: { report: DiagnosticReport }) {
  const rows: [string, string][] = [
    ['Report ID', report.id],
    ['Engine version', report.engine_version],
    ['Analysis started', formatDateTime(report.created_at)],
    ['Analysis completed', formatDateTime(report.completed_at)],
    ...Object.entries(report.metadata)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]): [string, string] => [key, display(value)]),
  ]
  return (
    <Card>
      <CardHeader title="Diagnostic metadata" description="Provenance of this report." />
      <CardBody className="py-1">
        <dl className="divide-y divide-border">
          {rows.map(([key, value]) => (
            <div key={key} className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[160px_1fr] sm:gap-4">
              <dt className="font-mono text-xs text-subtle">{key}</dt>
              <dd className="min-w-0 font-mono text-[13px] break-all text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      </CardBody>
    </Card>
  )
}

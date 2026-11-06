import type { DiagnosticReport } from '../../types/api'
import { groupIssues } from '../../utils/groupIssues'
import { Alert } from '../ui/Alert'
import { Card, CardBody } from '../ui/Card'
import { AnalysisStatusBadge } from './badges'
import { IssueCard } from './IssueCard'
import { MetadataTable } from './MetadataTable'
import { TransactionSummary } from './TransactionSummary'

export function ReportView({ report }: { report: DiagnosticReport }) {
  const groups = groupIssues(report.issues)
  const txStatus = report.transaction?.status

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-fg">Summary</h2>
            <AnalysisStatusBadge status={report.status} />
          </div>
          <p className="text-sm leading-relaxed text-fg/90">{report.summary}</p>
        </CardBody>
      </Card>

      {report.status === 'pending' && (
        <Alert tone="info" title="Analysis still running">
          The backend has not finished this analysis yet. Reload the page to check again.
        </Alert>
      )}
      {report.status === 'failed' && (
        <Alert tone="warning" title="The analysis could not be completed">
          SorobanLens was unable to finish analyzing this transaction. Any information below is partial.
        </Alert>
      )}
      {txStatus === 'not_found' && (
        <Alert tone="warning" title="Transaction not found on this network">
          Stellar RPC has no record of this hash. Check that you selected the right network, that the
          transaction was actually submitted, and that it is within the RPC provider’s retention window.
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-8">
          {groups.length === 0 ? (
            <Alert
              tone={txStatus === 'success' ? 'success' : 'info'}
              title={txStatus === 'success' ? 'No failure detected' : 'No diagnostic issues reported'}
            >
              {txStatus === 'success'
                ? 'The transaction succeeded and no diagnostic rule reported a problem.'
                : 'The diagnostic engine did not produce any findings for this transaction. This does not prove there is no problem — the current rule set is limited.'}
            </Alert>
          ) : (
            groups.map(({ key, title, description, icon: Icon, issues }) => (
              <section key={key} aria-labelledby={`group-${key}`}>
                <div className="mb-3">
                  <h2 id={`group-${key}`} className="flex items-center gap-2 text-sm font-semibold text-fg">
                    <Icon className="size-4 text-subtle" aria-hidden />
                    {title}
                    <span className="text-xs font-normal text-subtle">({issues.length})</span>
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">{description}</p>
                </div>
                <div className="space-y-4">
                  {issues.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
        <div className="min-w-0 space-y-6">
          <TransactionSummary report={report} />
          <MetadataTable report={report} />
        </div>
      </div>
    </div>
  )
}

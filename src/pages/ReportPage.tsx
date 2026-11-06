import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { AnalysisError } from '../components/analysis/AnalysisError'
import { ReportView } from '../components/diagnostics/ReportView'
import { Button } from '../components/ui/Button'
import { buttonClasses } from '../components/ui/buttonClasses'
import { PageHeader } from '../components/ui/PageHeader'
import { Spinner } from '../components/ui/Spinner'
import { useAnalysis, useAnalyzeTransaction } from '../hooks/useAnalysis'
import { paths } from '../routes/paths'
import { truncateMiddle } from '../utils/format'

export function ReportPage() {
  const { id = '' } = useParams()
  const analysis = useAnalysis(id)
  const reanalyze = useAnalyzeTransaction()

  const back = (
    <Link to={paths.dashboard} className={buttonClasses('ghost', 'sm')}>
      <ArrowLeft className="size-3.5" aria-hidden /> Dashboard
    </Link>
  )

  if (analysis.isPending) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted">
        <Spinner /> Loading report…
      </div>
    )
  }

  if (analysis.isError) {
    return (
      <>
        <PageHeader title="Diagnostic report" actions={back} />
        <div className="max-w-2xl space-y-4">
          <AnalysisError error={analysis.error} onRetry={() => void analysis.refetch()} />
          <p className="text-sm text-muted">
            Reports are kept in this browser’s history and, if the backend has persistence enabled, on the backend.{' '}
            <Link to={paths.analyze} className="text-accent hover:underline">
              Run a new analysis
            </Link>
            .
          </p>
        </div>
      </>
    )
  }

  const report = analysis.data
  return (
    <>
      <PageHeader
        title="Diagnostic report"
        description={<span className="font-mono">{truncateMiddle(report.transaction_hash, 12, 12)}</span>}
        actions={
          <>
            {back}
            <Button
              variant="secondary"
              size="sm"
              disabled={reanalyze.isPending}
              onClick={() =>
                reanalyze.mutate({
                  transaction_hash: report.transaction_hash,
                  network: report.network === 'mainnet' ? 'mainnet' : 'testnet',
                })
              }
            >
              {reanalyze.isPending ? <Spinner /> : <RefreshCw className="size-3.5" aria-hidden />} Re-analyze
            </Button>
          </>
        }
      />
      {reanalyze.isError && (
        <div className="mb-4">
          <AnalysisError error={reanalyze.error} />
        </div>
      )}
      {reanalyze.isSuccess && reanalyze.data.id !== report.id && (
        <p className="mb-4 text-sm text-muted">
          New analysis ready:{' '}
          <Link to={paths.report(reanalyze.data.id)} className="text-accent hover:underline">
            open the updated report
          </Link>
          .
        </p>
      )}
      <ReportView report={report} />
    </>
  )
}

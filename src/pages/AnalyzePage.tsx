import { useNavigate, useSearchParams } from 'react-router'
import { AnalysisError } from '../components/analysis/AnalysisError'
import { AnalyzeForm } from '../components/analysis/AnalyzeForm'
import { Alert } from '../components/ui/Alert'
import { Card, CardBody } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Spinner } from '../components/ui/Spinner'
import { useAnalyzeTransaction } from '../hooks/useAnalysis'
import { useSettings } from '../hooks/useSettings'
import { paths } from '../routes/paths'

export function AnalyzePage() {
  const { settings } = useSettings()
  const [params] = useSearchParams()
  const analyze = useAnalyzeTransaction()
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        title="Analyze transaction"
        description="Submit a Stellar transaction hash. The SorobanLens backend retrieves it from Stellar RPC and runs the diagnostic engine."
      />
      <div className="max-w-3xl space-y-4">
        <Card>
          <CardBody className="py-5">
            <AnalyzeForm
              defaultNetwork={settings.defaultNetwork}
              initialHash={params.get('hash') ?? ''}
              isSubmitting={analyze.isPending}
              onSubmit={(request) =>
                analyze.mutate(request, { onSuccess: (report) => navigate(paths.report(report.id)) })
              }
            />
          </CardBody>
        </Card>

        {analyze.isPending && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
            <Spinner /> Fetching the transaction from Stellar RPC and running diagnostic rules…
          </div>
        )}
        {analyze.isError && (
          <AnalysisError error={analyze.error} onRetry={() => analyze.variables && analyze.mutate(analyze.variables, { onSuccess: (report) => navigate(paths.report(report.id)) })} />
        )}

        <Alert tone="info" title="What to expect">
          Results come only from data the backend could retrieve. Findings are labeled as confirmed, likely, possible
          or insufficient data. Stellar RPC keeps transactions for a limited retention window, so older hashes may be
          reported as not found.
        </Alert>
      </div>
    </>
  )
}

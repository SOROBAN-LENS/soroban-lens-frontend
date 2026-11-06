import { Activity, CircleCheck, CircleX, ScanSearch } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { AnalysisError } from '../components/analysis/AnalysisError'
import { AnalyzeForm } from '../components/analysis/AnalyzeForm'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { StatCard } from '../components/dashboard/StatCard'
import { DemoBadge } from '../components/ui/Badge'
import { buttonClasses } from '../components/ui/buttonClasses'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { demoStats } from '../fixtures/sampleReport'
import { useAnalyzeTransaction } from '../hooks/useAnalysis'
import { useAnalysisHistory } from '../hooks/useAnalysisHistory'
import { useSettings } from '../hooks/useSettings'
import { paths } from '../routes/paths'
import { computeHistoryStats } from '../services/historyStore'

export function DashboardPage() {
  const history = useAnalysisHistory()
  const { settings } = useSettings()
  const analyze = useAnalyzeTransaction()
  const navigate = useNavigate()

  // There is no backend statistics endpoint yet, so stats are computed from
  // this browser's local history. With no history we show labeled demo data.
  // TODO(api): switch to a backend stats endpoint once one exists.
  const isDemo = history.length === 0
  const stats = isDemo ? demoStats : computeHistoryStats(history)
  const source = isDemo ? 'Illustrative values' : 'From this browser’s history'

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of transactions analyzed from this browser."
        actions={
          <Link to={paths.analyze} className={buttonClasses('primary', 'md')}>
            <ScanSearch className="size-4" aria-hidden /> New analysis
          </Link>
        }
      />

      <section aria-labelledby="overview-heading" className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <h2 id="overview-heading" className="text-sm font-semibold text-fg">
            Overview
          </h2>
          {isDemo ? <DemoBadge /> : <span className="text-xs text-subtle">Local history only — not network-wide data</span>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total analyzed" value={stats.total} icon={Activity} hint={source} />
          <StatCard label="Successful analyses" value={stats.completedAnalyses} icon={CircleCheck} hint="Analysis completed" />
          <StatCard label="Failed transactions" value={stats.failedTransactions} icon={CircleX} hint="On-chain status: failed" />
          <StatCard
            label="Successful transactions"
            value={stats.successfulTransactions}
            icon={CircleCheck}
            hint="On-chain status: success"
          />
        </div>
        {isDemo && (
          <p className="mt-2 text-xs text-subtle">
            These numbers are placeholders, not real network data. They are replaced by your own history after your
            first analysis.
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader title="Quick analysis" description="Analyze a transaction without leaving the dashboard." />
          <CardBody className="space-y-4">
            <AnalyzeForm
              compact
              defaultNetwork={settings.defaultNetwork}
              isSubmitting={analyze.isPending}
              onSubmit={(request) =>
                analyze.mutate(request, { onSuccess: (report) => navigate(paths.report(report.id)) })
              }
            />
            {analyze.isError && <AnalysisError error={analyze.error} />}
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Recent diagnostic activity"
            description={settings.saveHistory ? 'Stored in this browser.' : 'History saving is off (Settings).'}
          />
          <RecentActivity entries={history} />
        </Card>
      </div>
    </>
  )
}

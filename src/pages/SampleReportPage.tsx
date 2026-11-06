import { Link } from 'react-router'
import { ReportView } from '../components/diagnostics/ReportView'
import { Alert } from '../components/ui/Alert'
import { DemoBadge } from '../components/ui/Badge'
import { buttonClasses } from '../components/ui/buttonClasses'
import { PageHeader } from '../components/ui/PageHeader'
import { sampleReport } from '../fixtures/sampleReport'
import { paths } from '../routes/paths'

/** Static preview of the result UI. Never calls the backend. */
export function SampleReportPage() {
  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            Sample diagnostic report <DemoBadge label="Sample" />
          </span>
        }
        description="An illustrative report showing how SorobanLens presents its findings."
        actions={
          <Link to={paths.analyze} className={buttonClasses('primary', 'sm')}>
            Analyze a real transaction
          </Link>
        }
      />
      <Alert tone="warning" title="This is not a real analysis" className="mb-6">
        The transaction hash, contract and findings below are hand-written example data. They do not describe any
        transaction on the Stellar network.
      </Alert>
      <ReportView report={sampleReport} />
    </>
  )
}

import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import type { DiagnosticReport } from '../../types/api'
import { explorerTxUrl, formatDateTime, formatNumber, formatStroops } from '../../utils/format'
import { networkLabel } from '../../utils/labels'
import { Card, CardBody, CardHeader } from '../ui/Card'
import { CopyButton } from '../ui/CopyButton'
import { TransactionStatusBadge } from './badges'

function Row({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="text-xs text-subtle">{label}</dt>
      <dd className={mono ? 'min-w-0 font-mono text-[13px] break-all text-fg' : 'min-w-0 text-sm text-fg'}>
        {children}
      </dd>
    </div>
  )
}

/** On-chain facts about the transaction, exactly as retrieved by the backend. */
export function TransactionSummary({ report }: { report: DiagnosticReport }) {
  const tx = report.transaction
  const explorer = explorerTxUrl(report.network, report.transaction_hash)

  return (
    <Card>
      <CardHeader
        title="Transaction"
        description="Retrieved from Stellar RPC by the SorobanLens backend."
        action={tx ? <TransactionStatusBadge status={tx.status} /> : undefined}
      />
      <CardBody className="py-1">
        <dl className="divide-y divide-border">
          <Row label="Transaction hash" mono>
            <span className="inline-flex items-start gap-1">
              <span>{report.transaction_hash}</span>
              <CopyButton value={report.transaction_hash} label="Copy transaction hash" className="-mt-1 shrink-0" />
            </span>
          </Row>
          <Row label="Network">{networkLabel(report.network)}</Row>
          {tx ? (
            <>
              <Row label="Result code" mono>
                {tx.result_code ?? '—'}
              </Row>
              <Row label="Ledger" mono>
                {formatNumber(tx.ledger)}
              </Row>
              <Row label="Ledger close time">{formatDateTime(tx.created_at)}</Row>
              <Row label="Fee charged">{formatStroops(tx.fee_charged)}</Row>
              <Row label="Operations">{formatNumber(tx.operation_count)}</Row>
              {tx.contract_id && (
                <Row label="Contract" mono>
                  {tx.contract_id}
                </Row>
              )}
              {tx.function_name && (
                <Row label="Function" mono>
                  {tx.function_name}
                </Row>
              )}
            </>
          ) : (
            <Row label="Details">
              <span className="text-muted">
                Transaction data could not be retrieved, so no on-chain details are available.
              </span>
            </Row>
          )}
        </dl>
        {explorer && tx?.status !== 'not_found' && (
          <a
            href={explorer}
            target="_blank"
            rel="noreferrer noopener"
            className="my-3 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            View on stellar.expert <ExternalLink className="size-3" aria-hidden />
          </a>
        )}
      </CardBody>
    </Card>
  )
}

import { ScanSearch } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { NETWORKS, type StellarNetwork, type TransactionRequest } from '../../types/api'
import { cn } from '../../utils/cn'
import { networkLabel } from '../../utils/labels'
import { validateTransactionHash } from '../../utils/validation'
import { Button } from '../ui/Button'
import { FieldLabel, Input, Select } from '../ui/Field'
import { Spinner } from '../ui/Spinner'

export interface AnalyzeFormProps {
  defaultNetwork: StellarNetwork
  initialHash?: string
  isSubmitting?: boolean
  onSubmit: (request: TransactionRequest) => void
  /** Compact layout for the dashboard quick-analysis card. */
  compact?: boolean
}

/**
 * Transaction hash + network form. Validates locally before anything is sent,
 * so obviously malformed hashes never reach the backend.
 */
export function AnalyzeForm({ defaultNetwork, initialHash = '', isSubmitting, onSubmit, compact }: AnalyzeFormProps) {
  const id = useId()
  const [hash, setHash] = useState(initialHash)
  const [network, setNetwork] = useState<StellarNetwork>(defaultNetwork)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validateTransactionHash(hash)
    if (!result.valid) {
      setError(result.reason)
      return
    }
    setError(null)
    setHash(result.value)
    onSubmit({ transaction_hash: result.value, network })
  }

  const hashId = `${id}-hash`
  const errorId = `${id}-error`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className={cn('grid gap-3', compact ? 'sm:grid-cols-[1fr_140px]' : 'sm:grid-cols-[1fr_160px]')}>
        <div>
          <FieldLabel htmlFor={hashId} hint="64 hex characters">
            Transaction hash
          </FieldLabel>
          <Input
            id={hashId}
            name="transaction_hash"
            value={hash}
            onChange={(e) => {
              setHash(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Paste a 64-character transaction hash"
            autoComplete="off"
            spellCheck={false}
            invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="font-mono text-[13px]"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <FieldLabel htmlFor={`${id}-network`}>Network</FieldLabel>
          <Select
            id={`${id}-network`}
            name="network"
            value={network}
            onChange={(e) => setNetwork(e.target.value as StellarNetwork)}
            disabled={isSubmitting}
          >
            {NETWORKS.map((n) => (
              <option key={n} value={n}>
                {networkLabel(n)}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} size={compact ? 'md' : 'lg'} className="w-full sm:w-auto">
        {isSubmitting ? (
          <>
            <Spinner label="Analyzing" /> Analyzing…
          </>
        ) : (
          <>
            <ScanSearch className="size-4" aria-hidden /> Analyze transaction
          </>
        )}
      </Button>
    </form>
  )
}

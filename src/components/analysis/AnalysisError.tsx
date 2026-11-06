import { describeError, isApiError } from '../../services/apiErrors'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'

/** Maps any API failure onto a friendly, non-leaky error message. */
export function AnalysisError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { title, detail } = describeError(error)
  const canRetry = Boolean(onRetry) && isApiError(error) && error.isRetryable
  return (
    <Alert
      tone="danger"
      title={title}
      action={
        canRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    >
      {detail}
    </Alert>
  )
}

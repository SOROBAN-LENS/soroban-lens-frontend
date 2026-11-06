/**
 * ILLUSTRATIVE SAMPLE — NOT REAL ANALYSIS.
 *
 * A hand-written DiagnosticReport used to preview the result UI without a
 * running backend. The hash is synthetic and does not refer to any real
 * transaction. Every place that renders this fixture must show a DemoBadge.
 *
 * The shape follows docs/API_CONTRACT.md; it is validated against the zod
 * schema in tests so it cannot silently drift from the contract.
 */
import type { DiagnosticReport } from '../types/api'

export const SAMPLE_REPORT_ID = 'sample'

export const sampleReport: DiagnosticReport = {
  id: SAMPLE_REPORT_ID,
  transaction_hash: '0000000000000000000000000000000000000000000000000000000000000000',
  network: 'testnet',
  status: 'completed',
  transaction: {
    hash: '0000000000000000000000000000000000000000000000000000000000000000',
    status: 'failed',
    ledger: 123456,
    created_at: '2026-01-15T10:24:31Z',
    application_order: 1,
    fee_charged: '102345',
    result_code: 'txFAILED',
    operation_count: 1,
    contract_id: 'CSAMPLE00000000000000000000000000000000000000000000000000',
    function_name: 'withdraw',
    latest_ledger: 123500,
  },
  summary:
    'Sample: the contract call failed because a required authorization was not provided for the `withdraw` invocation.',
  issues: [
    {
      id: 'sample-1',
      rule_id: 'auth.invalid_action',
      category: 'authorization',
      severity: 'error',
      evidence: 'confirmed',
      title: 'Missing or mismatched authorization',
      technical_explanation:
        'The host returned Error(Auth, InvalidAction): `require_auth` was called for an address whose authorization entries did not cover this invocation.',
      human_explanation:
        'The contract asked an account to approve this call, but the transaction did not carry a matching approval.',
      possible_causes: [
        'The transaction was not re-simulated after changing arguments, so the auth entries no longer match.',
        'The signer of the auth entry is not the address the contract requires.',
        'The authorization entry expired (signature expiration ledger passed).',
      ],
      suggested_fixes: [
        {
          title: 'Re-simulate before submitting',
          description:
            'Run simulateTransaction with the final arguments and attach the returned authorization entries.',
          docs_url: 'https://developers.stellar.org/docs/learn/fundamentals/contract-development/authorization',
          command: null,
        },
        {
          title: 'Check which address calls require_auth',
          description: 'Confirm the address passed to the function is the one that signs the authorization entry.',
          docs_url: null,
          command: null,
        },
      ],
      raw_error: 'HostError: Error(Auth, InvalidAction)',
    },
    {
      id: 'sample-2',
      rule_id: 'auth.signature_expired',
      category: 'authorization',
      severity: 'warning',
      evidence: 'possible',
      title: 'Authorization entry may have expired',
      technical_explanation:
        'Soroban authorization entries carry a signature expiration ledger. Entries used after that ledger are rejected.',
      human_explanation: 'If the approval was signed a while before submission, it may no longer be valid.',
      possible_causes: ['Long delay between signing and submission.'],
      suggested_fixes: [
        {
          title: 'Sign closer to submission',
          description: 'Use a signature expiration ledger far enough ahead for your signing workflow.',
          docs_url: null,
          command: null,
        },
      ],
      raw_error: null,
    },
  ],
  engine_version: 'sample',
  created_at: '2026-01-15T10:30:00Z',
  completed_at: '2026-01-15T10:30:01Z',
  metadata: { sample: true, rpc_method: 'getTransaction', rules_evaluated: 6 },
}

/**
 * ILLUSTRATIVE dashboard numbers shown only when this browser has no local
 * history yet. Always rendered next to a DemoBadge.
 */
export const demoStats = {
  total: 42,
  completedAnalyses: 40,
  failedTransactions: 31,
  successfulTransactions: 9,
} as const

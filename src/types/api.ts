/**
 * SorobanLens REST API contract (v1) — frontend side.
 *
 * These schemas are the single source of truth for the wire format on the
 * frontend: TypeScript types are inferred from them and every backend response
 * is validated at runtime before it reaches the UI. The same contract is
 * documented in `docs/API_CONTRACT.md` and must stay in sync with the Rust
 * models in `soroban-lens-backend` (serde, `rename_all = "snake_case"`).
 *
 * Forward compatibility: enum-like fields fall back to a safe value when the
 * backend introduces a variant this frontend does not know yet, so a newer
 * backend never breaks an older UI.
 */
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

export const NETWORKS = ['testnet', 'mainnet'] as const
export const networkSchema = z.enum(NETWORKS)
export type StellarNetwork = z.infer<typeof networkSchema>

/** Lifecycle of the *analysis job* (not of the transaction itself). */
export const ANALYSIS_STATUSES = ['pending', 'completed', 'failed'] as const
export const analysisStatusSchema = z.enum(ANALYSIS_STATUSES)
export type AnalysisStatus = z.infer<typeof analysisStatusSchema>

/**
 * On-chain outcome as reported by Stellar RPC `getTransaction`
 * (`SUCCESS` | `FAILED` | `NOT_FOUND`), lower-cased by the backend.
 */
export const TRANSACTION_STATUSES = ['success', 'failed', 'not_found'] as const
export const transactionStatusSchema = z.enum(TRANSACTION_STATUSES)
export type TransactionStatus = z.infer<typeof transactionStatusSchema>

export const ERROR_CATEGORIES = [
  'authorization',
  'contract_execution',
  'invalid_arguments',
  'resource_limit',
  'missing_contract',
  'simulation',
  'network_rpc',
  'transaction',
  'unknown',
] as const
export const errorCategorySchema = z.enum(ERROR_CATEGORIES).catch('unknown')
export type ErrorCategory = (typeof ERROR_CATEGORIES)[number]

export const SEVERITIES = ['critical', 'error', 'warning', 'info'] as const
export const severitySchema = z.enum(SEVERITIES).catch('info')
export type Severity = (typeof SEVERITIES)[number]

/**
 * How strongly the available data supports an issue.
 *  - confirmed:          read directly from transaction result data
 *  - likely:             strong rule match, but not proven by the data alone
 *  - possible:           consistent with the data; other explanations exist
 *  - insufficient_data:  not enough information to draw a conclusion
 */
export const EVIDENCE_LEVELS = ['confirmed', 'likely', 'possible', 'insufficient_data'] as const
export const evidenceLevelSchema = z.enum(EVIDENCE_LEVELS).catch('insufficient_data')
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number]

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export interface TransactionRequest {
  /** 64-character hex SHA-256 transaction hash (lower-case). */
  transaction_hash: string
  network: StellarNetwork
}

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']).catch('degraded'),
  version: z.string(),
  uptime_seconds: z.number().nullish(),
})
export type HealthResponse = z.infer<typeof healthResponseSchema>

export const apiInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  api_version: z.string(),
  networks: z.array(z.string()).default([]),
  persistence_enabled: z.boolean().default(false),
})
export type ApiInfo = z.infer<typeof apiInfoSchema>

export const suggestedFixSchema = z.object({
  title: z.string(),
  description: z.string(),
  docs_url: z.string().nullish(),
  command: z.string().nullish(),
})
export type SuggestedFix = z.infer<typeof suggestedFixSchema>

export const diagnosticIssueSchema = z.object({
  id: z.string(),
  /** Stable identifier of the rule that produced this issue, e.g. `auth.invalid_action`. */
  rule_id: z.string(),
  category: errorCategorySchema,
  severity: severitySchema,
  evidence: evidenceLevelSchema,
  title: z.string(),
  technical_explanation: z.string(),
  human_explanation: z.string(),
  possible_causes: z.array(z.string()).default([]),
  suggested_fixes: z.array(suggestedFixSchema).default([]),
  /** Raw error text/code exactly as observed (e.g. `Error(Auth, InvalidAction)`). */
  raw_error: z.string().nullish(),
})
export type DiagnosticIssue = z.infer<typeof diagnosticIssueSchema>

export const transactionInformationSchema = z.object({
  hash: z.string(),
  status: transactionStatusSchema,
  ledger: z.number().int().nullish(),
  /** ISO-8601 close time of the ledger that included the transaction. */
  created_at: z.string().nullish(),
  application_order: z.number().int().nullish(),
  /** Stroops, serialized as a string to avoid i64 precision loss in JS. */
  fee_charged: z.string().nullish(),
  /** Transaction result code, e.g. `txFAILED`, `txSUCCESS`. */
  result_code: z.string().nullish(),
  operation_count: z.number().int().nullish(),
  contract_id: z.string().nullish(),
  function_name: z.string().nullish(),
  latest_ledger: z.number().int().nullish(),
})
export type TransactionInformation = z.infer<typeof transactionInformationSchema>

export const metadataValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])

export const diagnosticReportSchema = z.object({
  id: z.string(),
  transaction_hash: z.string(),
  network: z.string(),
  status: analysisStatusSchema,
  /** `null` when the transaction could not be retrieved (e.g. RPC unavailable). */
  transaction: transactionInformationSchema.nullable(),
  summary: z.string(),
  issues: z.array(diagnosticIssueSchema).default([]),
  engine_version: z.string(),
  created_at: z.string(),
  completed_at: z.string().nullish(),
  metadata: z.record(z.string(), metadataValueSchema).default({}),
})
export type DiagnosticReport = z.infer<typeof diagnosticReportSchema>

/** Error envelope returned by the backend for every non-2xx response. */
export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    request_id: z.string().nullish(),
  }),
})
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>

/** Error codes the backend is expected to emit. Unknown codes are still handled. */
export const KNOWN_ERROR_CODES = [
  'invalid_request',
  'invalid_transaction_hash',
  'unsupported_network',
  'not_found',
  'persistence_disabled',
  'payload_too_large',
  'rate_limited',
  'rpc_unavailable',
  'rpc_timeout',
  'internal_error',
] as const
export type KnownErrorCode = (typeof KNOWN_ERROR_CODES)[number]

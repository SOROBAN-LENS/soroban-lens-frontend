# SorobanLens API contract (v1): frontend view

This document describes the REST API the frontend expects from
`soroban-lens-backend`. The executable version is `src/types/api.ts` (zod
schemas); keep both in sync with the backend's serde models.

Conventions: JSON, `snake_case` field names, ISO-8601 UTC timestamps, stroop
amounts as strings (i64-safe). Optional fields may be omitted or `null`.

## Endpoints

| Method | Path | Success | Notes |
| --- | --- | --- | --- |
| GET | `/health` | `200 HealthResponse` | Liveness |
| GET | `/api/v1` | `200 ApiInfo` | Version, networks, persistence flag |
| POST | `/api/v1/analyze` | `200 DiagnosticReport` | Body: `TransactionRequest` |
| GET | `/api/v1/analyze/:id` | `200 DiagnosticReport` | `404 not_found`, or `501 persistence_disabled` when the backend stores nothing |

## Types

```ts
TransactionRequest  { transaction_hash: string /* 64 lower-case hex */, network: "testnet" | "mainnet" }
HealthResponse      { status: "ok" | "degraded", version: string, uptime_seconds?: number }
ApiInfo             { name, version, api_version: string, networks: string[], persistence_enabled: boolean }

DiagnosticReport {
  id: string
  transaction_hash: string
  network: string
  status: AnalysisStatus                 // "pending" | "completed" | "failed" (the analysis job)
  transaction: TransactionInformation | null   // null if it could not be retrieved
  summary: string
  issues: DiagnosticIssue[]
  engine_version: string
  created_at: string
  completed_at?: string
  metadata: Record<string, string | number | boolean | null>
}

TransactionInformation {
  hash: string
  status: "success" | "failed" | "not_found"   // Stellar RPC getTransaction status, lower-cased
  ledger?, application_order?, operation_count?, latest_ledger?: number
  created_at?: string                          // ledger close time
  fee_charged?: string                         // stroops
  result_code?: string                         // e.g. "txFAILED"
  contract_id?, function_name?: string
}

DiagnosticIssue {
  id, rule_id: string                          // rule_id e.g. "auth.invalid_action"
  category: ErrorCategory
  severity: "critical" | "error" | "warning" | "info"
  evidence: "confirmed" | "likely" | "possible" | "insufficient_data"
  title, technical_explanation, human_explanation: string
  possible_causes: string[]
  suggested_fixes: SuggestedFix[]
  raw_error?: string                           // exactly as observed, e.g. "Error(Auth, InvalidAction)"
}

SuggestedFix { title: string, description: string, docs_url?: string, command?: string }

ErrorCategory = "authorization" | "contract_execution" | "invalid_arguments" | "resource_limit"
              | "missing_contract" | "simulation" | "network_rpc" | "transaction" | "unknown"
```

### Evidence levels

- `confirmed`: read directly from transaction result data.
- `likely`: strong rule match, not proven by the data alone.
- `possible`: consistent with the data; other explanations exist.
- `insufficient_data`: not enough information to conclude.

## Errors

Every non-2xx response:

```json
{ "error": { "code": "invalid_transaction_hash", "message": "…", "request_id": "…" } }
```

Codes: `invalid_request`, `invalid_transaction_hash`, `unsupported_network`,
`not_found`, `persistence_disabled`, `payload_too_large`, `rate_limited`
(with optional `Retry-After` header), `rpc_unavailable`, `rpc_timeout`,
`internal_error`.

The frontend shows backend messages for 4xx responses. For 5xx it shows a
generic message plus `request_id`.

## Compatibility

Unknown `category`, `severity` and `evidence` values are mapped by the
frontend to `unknown`, `info` and `insufficient_data`, so additive backend
changes do not break older frontends. Removing or renaming fields is a breaking
change and requires `/api/v2`.

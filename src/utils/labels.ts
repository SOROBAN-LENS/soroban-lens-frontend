/**
 * Human-readable labels for the shared diagnostic vocabulary. These strings are
 * the canonical terminology used across SorobanLens repositories — keep them
 * aligned with `docs/API_CONTRACT.md` and the backend's error-analyzer.
 */
import type {
  AnalysisStatus,
  ErrorCategory,
  EvidenceLevel,
  Severity,
  TransactionStatus,
} from '../types/api'

export const CATEGORY_META: Record<ErrorCategory, { label: string; description: string }> = {
  authorization: {
    label: 'Authorization',
    description:
      'A required authorization (require_auth) was missing, did not match the invocation, or had an invalid signature.',
  },
  contract_execution: {
    label: 'Contract execution',
    description:
      'The contract trapped or returned a contract-defined error while executing (e.g. panic, explicit Error(Contract, #n)).',
  },
  invalid_arguments: {
    label: 'Invalid arguments',
    description:
      'Arguments passed to the contract function had the wrong type, count, or failed the contract’s own validation.',
  },
  resource_limit: {
    label: 'Resource limit',
    description:
      'Execution exceeded CPU instructions, memory, ledger I/O, or the declared resource fee / footprint.',
  },
  missing_contract: {
    label: 'Missing contract',
    description:
      'A referenced contract, Wasm code entry, or ledger entry was not found or has been archived (TTL expired).',
  },
  simulation: {
    label: 'Simulation',
    description:
      'The transaction failed during simulateTransaction, before it was submitted to the network.',
  },
  network_rpc: {
    label: 'Network / RPC',
    description:
      'SorobanLens could not retrieve data from Stellar RPC (timeout, unavailable endpoint, or retention window exceeded).',
  },
  transaction: {
    label: 'Transaction',
    description:
      'Transaction-level failure unrelated to contract logic (e.g. bad sequence number, insufficient fee, expired time bounds).',
  },
  unknown: {
    label: 'Unclassified',
    description: 'The failure did not match any known diagnostic rule.',
  },
}

export const EVIDENCE_META: Record<EvidenceLevel, { label: string; description: string }> = {
  confirmed: {
    label: 'Confirmed',
    description: 'Read directly from the transaction result data returned by Stellar RPC.',
  },
  likely: {
    label: 'Likely cause',
    description: 'A strong rule match, but not proven by the transaction data alone.',
  },
  possible: {
    label: 'Possible cause',
    description: 'Consistent with the available data; other explanations are possible.',
  },
  insufficient_data: {
    label: 'Insufficient data',
    description: 'Not enough diagnostic information was available to draw a conclusion.',
  },
}

export const SEVERITY_META: Record<Severity, { label: string }> = {
  critical: { label: 'Critical' },
  error: { label: 'Error' },
  warning: { label: 'Warning' },
  info: { label: 'Info' },
}

export const TRANSACTION_STATUS_META: Record<TransactionStatus, { label: string; description: string }> = {
  success: { label: 'Succeeded', description: 'The transaction was applied successfully.' },
  failed: { label: 'Failed', description: 'The transaction was included in a ledger but failed.' },
  not_found: {
    label: 'Not found',
    description:
      'Stellar RPC has no record of this hash. It may be on another network, still pending, or older than the RPC retention window.',
  },
}

export const ANALYSIS_STATUS_META: Record<AnalysisStatus, { label: string }> = {
  pending: { label: 'Analysis pending' },
  completed: { label: 'Analysis completed' },
  failed: { label: 'Analysis failed' },
}

export const NETWORK_LABELS: Record<string, string> = {
  testnet: 'Testnet',
  mainnet: 'Mainnet',
}

export function networkLabel(network: string): string {
  return NETWORK_LABELS[network] ?? network
}

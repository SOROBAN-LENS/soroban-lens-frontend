/**
 * A Stellar transaction hash is the hex-encoded SHA-256 of the transaction
 * signature payload: exactly 32 bytes = 64 hexadecimal characters.
 */
const TX_HASH_PATTERN = /^[0-9a-f]{64}$/

export type HashValidationResult =
  | { valid: true; value: string }
  | { valid: false; reason: string }

/** Trims and lower-cases user input so pasted hashes are accepted as typed. */
export function normalizeTransactionHash(input: string): string {
  return input.trim().toLowerCase()
}

export function validateTransactionHash(input: string): HashValidationResult {
  const value = normalizeTransactionHash(input)
  if (value.length === 0) {
    return { valid: false, reason: 'Enter a transaction hash.' }
  }
  if (value.startsWith('0x')) {
    return { valid: false, reason: 'Stellar transaction hashes are not 0x-prefixed. Remove the "0x".' }
  }
  if (/[^0-9a-f]/.test(value)) {
    return { valid: false, reason: 'A transaction hash may only contain hexadecimal characters (0-9, a-f).' }
  }
  if (value.length !== 64) {
    return {
      valid: false,
      reason: `A transaction hash is 64 characters long (got ${value.length}).`,
    }
  }
  return TX_HASH_PATTERN.test(value)
    ? { valid: true, value }
    : { valid: false, reason: 'Invalid transaction hash.' }
}

export function isValidTransactionHash(input: string): boolean {
  return validateTransactionHash(input).valid
}

/** Validates an http(s) base URL; empty string means "same origin". */
export function validateBaseUrl(input: string): { valid: true } | { valid: false; reason: string } {
  const value = input.trim()
  if (value === '') return { valid: true }
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { valid: false, reason: 'Use an http:// or https:// URL.' }
    }
    if (url.search || url.hash) {
      return { valid: false, reason: 'The base URL must not contain a query string or fragment.' }
    }
    return { valid: true }
  } catch {
    return { valid: false, reason: 'Enter a valid URL, e.g. http://localhost:8080' }
  }
}

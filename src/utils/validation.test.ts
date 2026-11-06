import { describe, expect, it } from 'vitest'
import { validateBaseUrl, validateTransactionHash } from './validation'

const HASH = 'a'.repeat(64)

describe('validateTransactionHash', () => {
  it('accepts a 64-char hex hash and normalizes case/whitespace', () => {
    expect(validateTransactionHash(`  ${HASH.toUpperCase()} `)).toEqual({ valid: true, value: HASH })
  })
  it.each([
    ['', 'Enter a transaction hash.'],
    [`0x${HASH}`, 'not 0x-prefixed'],
    ['z'.repeat(64), 'hexadecimal'],
    ['abc', 'got 3'],
  ])('rejects %j', (input, reason) => {
    const result = validateTransactionHash(input)
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toContain(reason)
  })
})

describe('validateBaseUrl', () => {
  it('allows empty (same origin) and http(s) URLs', () => {
    expect(validateBaseUrl('').valid).toBe(true)
    expect(validateBaseUrl('http://localhost:8080').valid).toBe(true)
  })
  it('rejects other protocols, queries and garbage', () => {
    expect(validateBaseUrl('ftp://x').valid).toBe(false)
    expect(validateBaseUrl('https://x.dev/?a=1').valid).toBe(false)
    expect(validateBaseUrl('not a url').valid).toBe(false)
  })
})

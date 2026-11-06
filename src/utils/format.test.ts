import { describe, expect, it } from 'vitest'
import { explorerTxUrl, formatStroops, truncateMiddle } from './format'

describe('format', () => {
  it('truncates long values in the middle', () => {
    expect(truncateMiddle('abcdefghijklmnopqrstuvwxyz', 4, 4)).toBe('abcd…wxyz')
    expect(truncateMiddle('short')).toBe('short')
  })
  it('formats stroops as XLM without float precision loss', () => {
    expect(formatStroops('100')).toBe('0.00001 XLM (100 stroops)')
    expect(formatStroops('10000000')).toMatch(/^1 XLM/)
    expect(formatStroops('9223372036854775807')).toMatch(/^922337203685\.4775807 XLM/)
    expect(formatStroops(null)).toBe('—')
    expect(formatStroops('abc')).toBe('—')
  })
  it('builds explorer links only for known networks', () => {
    expect(explorerTxUrl('mainnet', 'h')).toBe('https://stellar.expert/explorer/public/tx/h')
    expect(explorerTxUrl('futurenet', 'h')).toBeNull()
  })
})

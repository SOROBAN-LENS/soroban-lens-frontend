import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AnalyzeForm } from './AnalyzeForm'

describe('AnalyzeForm', () => {
  it('blocks invalid hashes without calling onSubmit', async () => {
    const onSubmit = vi.fn()
    render(<AnalyzeForm defaultNetwork="testnet" onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText(/transaction hash/i), 'xyz')
    await userEvent.click(screen.getByRole('button', { name: /analyze transaction/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/hexadecimal/)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a normalized hash with the chosen network', async () => {
    const onSubmit = vi.fn()
    render(<AnalyzeForm defaultNetwork="testnet" onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText(/transaction hash/i), ` ${'AB'.repeat(32)} `)
    await userEvent.selectOptions(screen.getByLabelText(/network/i), 'mainnet')
    await userEvent.click(screen.getByRole('button', { name: /analyze transaction/i }))
    expect(onSubmit).toHaveBeenCalledWith({ transaction_hash: 'ab'.repeat(32), network: 'mainnet' })
  })
})

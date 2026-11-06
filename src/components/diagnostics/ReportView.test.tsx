import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { sampleReport } from '../../fixtures/sampleReport'
import type { DiagnosticReport } from '../../types/api'
import { ReportView } from './ReportView'

const renderReport = (report: DiagnosticReport) =>
  render(
    <MemoryRouter>
      <ReportView report={report} />
    </MemoryRouter>,
  )

describe('ReportView', () => {
  it('separates confirmed findings from likely/possible causes', () => {
    renderReport(sampleReport)
    const confirmed = screen.getByRole('region', { name: /confirmed failure information/i })
    expect(within(confirmed).getByText('Missing or mismatched authorization')).toBeInTheDocument()
    const causes = screen.getByRole('region', { name: /likely and possible causes/i })
    expect(within(causes).getByText('Authorization entry may have expired')).toBeInTheDocument()
    expect(screen.getByText('HostError: Error(Auth, InvalidAction)')).toBeInTheDocument()
    expect(screen.getByText('Re-simulate before submitting')).toBeInTheDocument()
  })

  it('explains not-found transactions and does not claim success without data', () => {
    renderReport({
      ...sampleReport,
      issues: [],
      transaction: { ...sampleReport.transaction!, status: 'not_found' },
    })
    expect(screen.getByText(/transaction not found on this network/i)).toBeInTheDocument()
    expect(screen.getByText(/does not prove there is no problem/i)).toBeInTheDocument()
  })

  it('handles reports without transaction data', () => {
    renderReport({ ...sampleReport, transaction: null, status: 'failed' })
    expect(screen.getByText(/could not be completed/i)).toBeInTheDocument()
    expect(screen.getByText(/could not be retrieved/i)).toBeInTheDocument()
  })
})

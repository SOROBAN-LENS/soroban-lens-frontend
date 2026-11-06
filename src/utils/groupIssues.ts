import { CircleHelp, Search, ShieldCheck } from 'lucide-react'
import type { DiagnosticIssue, EvidenceLevel } from '../types/api'

export interface IssueGroup {
  key: string
  title: string
  description: string
  icon: typeof ShieldCheck
  levels: EvidenceLevel[]
}

/**
 * Issues are grouped by evidence level so confirmed facts are never visually
 * mixed with hypotheses — a core SorobanLens principle.
 */
export const ISSUE_GROUPS: IssueGroup[] = [
  {
    key: 'confirmed',
    title: 'Confirmed failure information',
    description: 'Read directly from the transaction result data.',
    icon: ShieldCheck,
    levels: ['confirmed'],
  },
  {
    key: 'causes',
    title: 'Likely and possible causes',
    description: 'Rule-based interpretations. Verify them before acting.',
    icon: Search,
    levels: ['likely', 'possible'],
  },
  {
    key: 'insufficient',
    title: 'Insufficient diagnostic information',
    description: 'Areas where the available data did not support a conclusion.',
    icon: CircleHelp,
    levels: ['insufficient_data'],
  },
]

const severityOrder = { critical: 0, error: 1, warning: 2, info: 3 } as const

export function groupIssues(issues: DiagnosticIssue[]) {
  return ISSUE_GROUPS.map((group) => ({
    ...group,
    issues: issues
      .filter((issue) => group.levels.includes(issue.evidence))
      .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]),
  })).filter((group) => group.issues.length > 0)
}

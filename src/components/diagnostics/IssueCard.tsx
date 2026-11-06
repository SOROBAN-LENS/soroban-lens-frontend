import { ChevronRight, ExternalLink, Lightbulb, ListChecks, Terminal } from 'lucide-react'
import type { DiagnosticIssue } from '../../types/api'
import { Card } from '../ui/Card'
import { CopyButton } from '../ui/CopyButton'
import { CategoryBadge, EvidenceBadge, SeverityBadge } from './badges'

/** Renders one diagnostic issue: classification, explanations, causes and fixes. */
export function IssueCard({ issue }: { issue: DiagnosticIssue }) {
  const headingId = `issue-${issue.id}`
  return (
    <Card className="overflow-hidden" aria-labelledby={headingId} role="article">
      <div className="border-b border-border px-5 py-4">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <SeverityBadge severity={issue.severity} />
          <CategoryBadge category={issue.category} />
          <EvidenceBadge evidence={issue.evidence} />
        </div>
        <h3 id={headingId} className="text-base font-semibold text-fg">
          {issue.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{issue.human_explanation}</p>
      </div>

      <div className="space-y-5 px-5 py-4">
        {issue.raw_error && (
          <section aria-label="Observed error">
            <h4 className="mb-1.5 text-xs font-medium tracking-wide text-subtle uppercase">Observed error</h4>
            <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
              <code className="min-w-0 flex-1 font-mono text-[13px] break-all text-fg">{issue.raw_error}</code>
              <CopyButton value={issue.raw_error} label="Copy error" className="shrink-0" />
            </div>
          </section>
        )}

        <section>
          <h4 className="mb-1.5 text-xs font-medium tracking-wide text-subtle uppercase">Technical explanation</h4>
          <p className="text-sm leading-relaxed text-fg/90">{issue.technical_explanation}</p>
        </section>

        {issue.possible_causes.length > 0 && (
          <section>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-subtle uppercase">
              <Lightbulb className="size-3.5" aria-hidden /> Possible causes
            </h4>
            <ul className="space-y-1.5">
              {issue.possible_causes.map((cause) => (
                <li key={cause} className="flex gap-2 text-sm text-fg/90">
                  <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-subtle" aria-hidden />
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {issue.suggested_fixes.length > 0 && (
          <section>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-subtle uppercase">
              <ListChecks className="size-3.5" aria-hidden /> Suggested debugging steps
            </h4>
            <ol className="space-y-3">
              {issue.suggested_fixes.map((fix, index) => (
                <li key={fix.title} className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border-strong text-[11px] text-muted">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-fg">{fix.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{fix.description}</p>
                    {fix.command && (
                      <div className="mt-2 flex items-start gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
                        <Terminal className="mt-0.5 size-3.5 shrink-0 text-subtle" aria-hidden />
                        <code className="min-w-0 flex-1 font-mono text-[12px] break-all text-fg">{fix.command}</code>
                        <CopyButton value={fix.command} label="Copy command" className="-my-1 shrink-0" />
                      </div>
                    )}
                    {fix.docs_url && /^https?:\/\//.test(fix.docs_url) && (
                      <a
                        href={fix.docs_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                      >
                        Documentation <ExternalLink className="size-3" aria-hidden />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <p className="font-mono text-[11px] text-subtle">rule: {issue.rule_id}</p>
      </div>
    </Card>
  )
}

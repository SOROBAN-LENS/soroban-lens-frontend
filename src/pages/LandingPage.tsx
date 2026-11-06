import { ArrowRight, Braces, FileSearch, Gauge, KeyRound, ListChecks, Network, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { buttonClasses } from '../components/ui/buttonClasses'
import { Card } from '../components/ui/Card'
import { paths } from '../routes/paths'

const steps = [
  {
    title: 'Submit a transaction hash',
    body: 'Paste the hash of a Soroban transaction and choose testnet or mainnet.',
  },
  {
    title: 'SorobanLens retrieves it',
    body: 'The backend fetches the transaction and its result from Stellar RPC (getTransaction).',
  },
  {
    title: 'Rules classify the failure',
    body: 'A rule-based diagnostic engine maps result codes and host errors onto known failure categories.',
  },
  {
    title: 'Read an explained report',
    body: 'Confirmed facts, likely causes and concrete debugging steps — kept clearly apart.',
  },
]

const capabilities = [
  { icon: KeyRound, title: 'Authorization failures', body: 'Missing or mismatched require_auth entries.' },
  { icon: Braces, title: 'Contract errors', body: 'Traps, panics and contract-defined Error(Contract, #n) codes.' },
  { icon: Gauge, title: 'Resource limits', body: 'CPU, memory and footprint budget overruns.' },
  { icon: FileSearch, title: 'Missing references', body: 'Unknown contracts, archived entries, expired TTLs.' },
  { icon: Network, title: 'RPC problems', body: 'Unavailable endpoints, timeouts and retention gaps — reported honestly.' },
  { icon: ShieldCheck, title: 'Evidence levels', body: 'Every finding says whether it is confirmed, likely or a guess.' },
]

const sampleJson = `POST /api/v1/analyze
{
  "transaction_hash": "<64 hex chars>",
  "network": "testnet"
}

→ 200 OK
{
  "status": "completed",
  "transaction": { "status": "failed", "result_code": "txFAILED", … },
  "issues": [{
    "category": "authorization",
    "evidence": "confirmed",
    "raw_error": "Error(Auth, InvalidAction)",
    "suggested_fixes": [ … ]
  }]
}`

export function LandingPage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-24">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            Open source · Stellar / Soroban
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            Making Soroban smart contract failures understandable.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            SorobanLens analyzes failed Soroban transactions, classifies what went wrong and explains how to fix it,
            without hiding uncertainty behind confident-sounding guesses.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={paths.analyze} className={buttonClasses('primary', 'lg')}>
              Analyze a transaction <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link to={paths.sampleReport} className={buttonClasses('secondary', 'lg')}>
              View a sample report
            </Link>
          </div>
          <p className="mt-4 text-xs text-subtle">
            Early development: the diagnostic rule set is small and growing. Requires a running SorobanLens backend.
          </p>
        </div>
        <Card className="overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-surface-3" />
            <span className="size-2.5 rounded-full bg-surface-3" />
            <span className="size-2.5 rounded-full bg-surface-3" />
            <span className="ml-2 font-mono text-xs text-subtle">api contract (illustrative)</span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-muted">
            <code>{sampleJson}</code>
          </pre>
        </Card>
      </section>

      <section id="how-it-works" className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-fg">How it works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-xl border border-border bg-surface p-5">
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
                <h3 className="mt-2 text-sm font-semibold text-fg">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="capabilities" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-fg">Key capabilities</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Failure categories the diagnostic engine is designed around. Coverage within each category grows as rules
            are added; see the documentation for what is implemented today.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3 rounded-xl border border-border bg-surface p-5">
                <Icon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                <div>
                  <h3 className="text-sm font-semibold text-fg">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-14 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
              <ListChecks className="size-5 text-accent" aria-hidden /> Built for developers
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              A typed REST API, stable diagnostic vocabulary, and three open repositories: frontend, Rust backend and
              example Soroban contracts.
            </p>
          </div>
          <Link to={paths.docs} className={buttonClasses('secondary', 'md')}>
            Read the developer guide
          </Link>
        </div>
      </section>
    </>
  )
}

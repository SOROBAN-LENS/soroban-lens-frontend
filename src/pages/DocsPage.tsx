import type { ReactNode } from 'react'
import { Card, CardBody } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { ERROR_CATEGORIES, EVIDENCE_LEVELS, KNOWN_ERROR_CODES } from '../types/api'
import { CATEGORY_META, EVIDENCE_META } from '../utils/labels'

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'quickstart', title: 'Local quickstart' },
  { id: 'api', title: 'API endpoints' },
  { id: 'report', title: 'Diagnostic report format' },
  { id: 'evidence', title: 'Evidence levels' },
  { id: 'categories', title: 'Error categories' },
  { id: 'errors', title: 'Error responses' },
  { id: 'limitations', title: 'Current limitations' },
]

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-20">
      <h2 id={`${id}-h`} className="mb-3 text-lg font-semibold tracking-tight text-fg">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  )
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-surface-2 p-4 font-mono text-[12.5px] leading-relaxed text-fg">
      <code>{children}</code>
    </pre>
  )
}

const endpoints: [string, string, string][] = [
  ['GET', '/health', 'Liveness and version of the backend.'],
  ['GET', '/api/v1', 'API name, version, supported networks and whether persistence is enabled.'],
  ['POST', '/api/v1/analyze', 'Retrieve a transaction from Stellar RPC and return a DiagnosticReport.'],
  ['GET', '/api/v1/analyze/:id', 'Fetch a stored report (only when the backend has persistence enabled).'],
]

export function DocsPage() {
  return (
    <>
      <PageHeader
        title="Documentation"
        description="Developer guide and API integration overview for SorobanLens v1."
      />
      <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-20 space-y-1 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-md px-2 py-1 text-muted hover:bg-surface-2 hover:text-fg">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-10">
          <Section id="overview" title="Overview">
            <p>
              SorobanLens has three repositories: this <strong className="text-fg">frontend</strong>, a Rust/Axum{' '}
              <strong className="text-fg">backend</strong> (API, Stellar RPC client, rule-based diagnostic engine) and a
              set of example Soroban <strong className="text-fg">contracts</strong> that reproduce known failure
              scenarios. The frontend talks to the backend only through the REST API below. It never contacts Stellar
              RPC directly.
            </p>
          </Section>

          <Section id="quickstart" title="Local quickstart">
            <p>Start the backend (default port 8080), then run the frontend dev server:</p>
            <Code>{`npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:5173`}</Code>
            <p>
              In development Vite proxies <code className="font-mono text-fg">/api</code> and{' '}
              <code className="font-mono text-fg">/health</code> to <code className="font-mono text-fg">VITE_DEV_PROXY_TARGET</code>,
              so no CORS setup is needed. To use a remote backend, set the API base URL in Settings or{' '}
              <code className="font-mono text-fg">VITE_API_BASE_URL</code> at build time. That backend must allow this
              origin in its CORS configuration.
            </p>
          </Section>

          <Section id="api" title="API endpoints">
            <Card>
              <CardBody className="overflow-x-auto p-0">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs text-subtle">
                    <tr>
                      <th scope="col" className="px-4 py-2 font-medium">Method</th>
                      <th scope="col" className="px-4 py-2 font-medium">Path</th>
                      <th scope="col" className="px-4 py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {endpoints.map(([method, path, desc]) => (
                      <tr key={path + method}>
                        <td className="px-4 py-2 font-mono text-xs text-accent">{method}</td>
                        <td className="px-4 py-2 font-mono text-xs whitespace-nowrap text-fg">{path}</td>
                        <td className="px-4 py-2 text-muted">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
            <p>Example request:</p>
            <Code>{`curl -X POST http://localhost:8080/api/v1/analyze \\
  -H 'Content-Type: application/json' \\
  -d '{"transaction_hash":"<64 hex chars>","network":"testnet"}'`}</Code>
          </Section>

          <Section id="report" title="Diagnostic report format">
            <p>
              Every analysis returns a <code className="font-mono text-fg">DiagnosticReport</code>. Field names are
              snake_case. Amounts in stroops are strings to avoid 64-bit precision loss.
            </p>
            <Code>{`{
  "id": "string",
  "transaction_hash": "64 hex chars",
  "network": "testnet | mainnet",
  "status": "pending | completed | failed",        // the analysis job
  "transaction": {                                  // null if it could not be retrieved
    "hash": "…", "status": "success | failed | not_found",
    "ledger": 123, "created_at": "ISO-8601", "fee_charged": "100",
    "result_code": "txFAILED", "operation_count": 1,
    "contract_id": "C…", "function_name": "…"
  },
  "summary": "string",
  "issues": [{
    "id": "…", "rule_id": "auth.invalid_action",
    "category": "authorization", "severity": "error", "evidence": "confirmed",
    "title": "…", "technical_explanation": "…", "human_explanation": "…",
    "possible_causes": ["…"],
    "suggested_fixes": [{ "title": "…", "description": "…", "docs_url": null, "command": null }],
    "raw_error": "Error(Auth, InvalidAction)"
  }],
  "engine_version": "0.1.0",
  "created_at": "ISO-8601", "completed_at": "ISO-8601",
  "metadata": { "key": "string | number | boolean | null" }
}`}</Code>
            <p>
              The frontend validates every response at runtime (zod). Unknown enum values fall back to safe defaults,
              so a newer backend does not break an older frontend.
            </p>
          </Section>

          <Section id="evidence" title="Evidence levels">
            <ul className="space-y-2">
              {EVIDENCE_LEVELS.map((level) => (
                <li key={level}>
                  <code className="font-mono text-fg">{level}</code>: {EVIDENCE_META[level].description}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="categories" title="Error categories">
            <ul className="space-y-2">
              {ERROR_CATEGORIES.map((category) => (
                <li key={category}>
                  <code className="font-mono text-fg">{category}</code>: {CATEGORY_META[category].description}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="errors" title="Error responses">
            <p>All non-2xx responses use one envelope:</p>
            <Code>{`{ "error": { "code": "invalid_transaction_hash", "message": "…", "request_id": "…" } }`}</Code>
            <p>
              Known codes:{' '}
              {KNOWN_ERROR_CODES.map((code, i) => (
                <span key={code}>
                  <code className="font-mono text-fg">{code}</code>
                  {i < KNOWN_ERROR_CODES.length - 1 ? ', ' : '.'}
                </span>
              ))}{' '}
              <code className="font-mono text-fg">429</code> responses may include a{' '}
              <code className="font-mono text-fg">Retry-After</code> header. For 5xx errors the frontend shows a generic
              message and the request ID, never server internals.
            </p>
          </Section>

          <Section id="limitations" title="Current limitations">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>The diagnostic rule set is small; many failures will be reported as unclassified or insufficient data.</li>
              <li>Simulation failures can only be diagnosed once a simulation endpoint exists; it is not part of v1 yet.</li>
              <li>Dashboard statistics come from this browser’s local history; there is no backend statistics endpoint yet.</li>
              <li>Stellar RPC keeps transactions for a limited retention window; older hashes return not found.</li>
              <li>SorobanLens is in early development and is not production-ready.</li>
            </ul>
          </Section>
        </div>
      </div>
    </>
  )
}

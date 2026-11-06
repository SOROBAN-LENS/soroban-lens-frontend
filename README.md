# SorobanLens Frontend

> Making Soroban smart contract failures understandable.

The web interface for **SorobanLens**, an open-source diagnostic platform that
helps developers understand and troubleshoot failed Soroban smart contract
transactions on the Stellar network.

> **Status:** early development (first milestone, about 30% of the planned
> scope). Not production-ready.

## Role in SorobanLens

| Repository | Responsibility |
| --- | --- |
| **soroban-lens-frontend** (this repo) | React UI: submit transactions, display diagnostic reports |
| soroban-lens-backend | Rust/Axum API, Stellar RPC client, rule-based diagnostic engine and error analyzer |
| soroban-lens-contracts | Example Soroban contracts that reproduce failure scenarios, used as test fixtures |

```
Browser ──REST──▶ soroban-lens-backend ──JSON-RPC──▶ Stellar RPC
                     └─ diagnostic engine / error analyzer
```

The frontend talks **only** to the SorobanLens backend. It never calls Stellar
RPC directly and contains no diagnostic logic of its own.

## Tech stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · React Router · TanStack
Query · zod (runtime validation of API responses) · lucide-react icons · Vitest +
Testing Library · oxlint.

## Features (implemented)

- **Landing page**: project overview, how it works, capabilities.
- **Dashboard**: overview cards, recent activity and a quick analysis form.
  Statistics come from this browser's local history. With no history, clearly
  labeled demo values are shown.
- **Transaction analyzer**: hash validation (64 hex chars), network selection,
  loading, error and retry states, `POST /api/v1/analyze`.
- **Diagnostic report**: transaction status, hash, classification, explanations,
  possible causes, debugging steps and metadata. Findings are grouped into
  *confirmed*, *likely/possible* and *insufficient data*.
- **Sample report** at `/app/reports/sample`: static, labeled example. Never calls the API.
- **Documentation page**: developer guide and API overview.
- **Settings**: API base URL, timeout, default network, theme, local history.
- **Backend status indicator** (polls `GET /health`).
- Centralized API client with timeouts, a normalized `ApiError`, safe
  user-facing messages (no 5xx internals) and `Retry-After` handling.

## Architecture

```
src/
  components/   ui/ primitives · analysis/ · diagnostics/ · dashboard/ · system/ · brand/
  pages/        one component per route
  layouts/      MarketingLayout (landing) · AppLayout (sidebar shell)
  routes/       route table and path helpers
  hooks/        TanStack Query + store hooks
  services/     apiClient, apiErrors, config, settings/history stores
  types/        API contract (zod) and settings types
  utils/        validation, formatting, labels, grouping
  fixtures/     labeled sample data
  styles/       design tokens (CSS variables → Tailwind theme)
```

See [docs/API_CONTRACT.md](docs/API_CONTRACT.md) for the wire format.

## Getting started

Requirements: Node.js ≥ 20.19, npm.

```bash
npm install
cp .env.example .env.local    # optional
npm run dev                   # http://localhost:5173
```

### Connecting to the backend

Run `soroban-lens-backend` locally (default `http://localhost:8080`). The Vite
dev server proxies `/api/*` and `/health` to `VITE_DEV_PROXY_TARGET`, so no CORS
configuration is needed in development.

For a deployed backend, either set `VITE_API_BASE_URL` at build time or enter
the URL on the **Settings** page. The backend must allow the frontend's origin
in its CORS configuration.

Without a backend the UI still works: the status indicator shows *Backend
offline* and analyses fail with a clear message. No results are faked.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | *(empty = same origin)* | Backend base URL, no trailing slash |
| `VITE_DEV_PROXY_TARGET` | `http://localhost:8080` | Dev-server proxy target |
| `VITE_DEFAULT_NETWORK` | `testnet` | `testnet` or `mainnet` |
| `VITE_REQUEST_TIMEOUT_MS` | `30000` | Client request timeout |

All `VITE_*` values are embedded in the public bundle. Never put secrets there.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | oxlint |
| `npm run typecheck` | `tsc -b` |
| `npm test` | Vitest (single run) |
| `npm run check` | All of the above, as run in CI |

## Testing

Tests cover hash and URL validation, formatting, the API client (success,
error envelope, rate limiting, 5xx redaction, invalid bodies, network errors,
timeouts), local stores, the analyzer form, report rendering (evidence
grouping, not-found and missing-data states) and page-level flows with a mocked
backend.

```bash
npm test
```

## Known limitations

- Depends on `soroban-lens-backend`. Results are only as complete as its rule set.
- Dashboard statistics are per-browser. There is no backend stats endpoint yet.
- No simulation (pre-submission) analysis yet.
- Reports can be reopened only from local history, or from the backend if it has persistence enabled.
- No authentication, report sharing or search.

## Next steps

- Backend statistics endpoint and a network-wide dashboard
- Simulation analysis (`simulateTransaction`) UI
- Shareable report links (requires backend persistence)
- Diagnostic event / contract event viewer
- Search and filtering of history
- End-to-end tests (Playwright) against a local backend with contract fixtures
- i18n

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).
Good first areas: accessibility, additional result visualizations, tests.

## License

[MIT](LICENSE)

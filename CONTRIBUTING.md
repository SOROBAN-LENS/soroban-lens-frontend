# Contributing to SorobanLens Frontend

Thanks for helping make Soroban failures understandable! This guide covers the
frontend repository. The backend (Rust/Axum) and example contracts live in their
own repositories (`soroban-lens-backend`, `soroban-lens-contracts`).

## Ground rules

- Be kind and follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- **Never present unverified data as real.** Demo or sample data must be
  rendered with a `DemoBadge` and come from `src/fixtures/`.
- Keep confirmed facts, likely causes and insufficient-data findings visually
  separate (see `src/utils/groupIssues.ts`).
- No secrets in the frontend. Every `VITE_*` variable ends up in the public bundle.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173, proxies /api and /health to :8080
npm run check      # lint + typecheck + tests + production build
```

Node.js ≥ 20.19 is required.

## Project layout

| Path | Purpose |
| --- | --- |
| `src/types/api.ts` | zod schemas = the API contract on the frontend side |
| `src/services/` | API client, error normalization, local stores |
| `src/hooks/` | TanStack Query and store hooks used by components |
| `src/components/ui/` | Design-system primitives (Button, Card, Badge, …) |
| `src/components/{analysis,diagnostics,dashboard,system}/` | Feature components |
| `src/pages/`, `src/layouts/`, `src/routes/` | Screens, shells and the route table |
| `src/fixtures/` | Clearly labeled sample data |

## Changing the API contract

The contract is shared with `soroban-lens-backend`. When it changes:

1. Update `docs/API_CONTRACT.md` **and** `src/types/api.ts` in the same PR.
2. Open a matching PR (or issue) in the backend repository and link it.
3. Prefer additive changes. Unknown enum values already fall back safely.

## Workflow

1. Open or pick an issue. Comment so others know you're working on it.
2. Branch from `main` (`feat/…`, `fix/…`, `docs/…`).
3. Write tests for behavior changes (Vitest + Testing Library; see `src/**/*.test.ts(x)`).
4. Run `npm run check` locally. CI runs the same command.
5. Open a PR using the template. Keep PRs focused.

### Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) where practical:
`feat: add fee breakdown to transaction summary`, `fix: handle 429 without Retry-After`.

## Style

- TypeScript strict mode, no `any` unless justified in a comment.
- Use design tokens (`bg-surface`, `text-muted`, `border-border`, …) rather than raw colors.
- Components must be keyboard accessible and labeled for screen readers.
- Keep business logic out of page components; put it in `services/`, `hooks/` or `utils/`.

## Reporting security issues

Please do **not** open a public issue for vulnerabilities. Contact the
maintainers privately through GitHub's security advisory feature
("Report a vulnerability" on the repository's Security tab).

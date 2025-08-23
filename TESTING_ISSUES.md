# QA Testing Report

This report captures issues and improvements found while formatting, linting, type-checking, building, and smoke-testing the app.

## Critical
- Vitest setup missing: `vitest.config.ts` references `test/setup.ts`, but no such file exists. Tests fail to run. Fix by adding `test/setup.ts` or removing from `setupFiles`.
- Test discovery is too broad: Vitest includes tests from `client/node_modules` and `realest/**`. Update `include`/`exclude` to avoid third-party and unrelated project tests (e.g., `include: ["server/**/*.test.ts"], exclude: ["**/node_modules/**", "realest/**", "dist/**", "build/**"]`).
- Missing dev dependency: Server API tests reference `supertest` but it is not installed. Add `supertest` and `@types/supertest` to `devDependencies`.
- Type mismatches in tests: Several test fixtures no longer match current schema types (e.g., missing `createdAt`, additional fields like `instagramHandle`, incompatible `client` shape). Update test data or zod/types to align.

## High
- Lint errors in client: Numerous `any` usages across `client/src/components/**` (e.g., `client-portal.tsx`, `dashboard.tsx`, `invoice-generator.tsx`). Enforce proper typings or use generics/unknown + narrowing.
- Vitest reporter deprecation: Using deprecated `basic` reporter in CLI example. Prefer default reporter or configure as advised by Vitest.
- Environment case-sensitivity: During local run, `NODE_ENV` logged as `"Production"`. Code checks use `=== 'production'`. Normalize `NODE_ENV` handling or coerce to lowercase to avoid misconfig paths in some environments.

## Medium
- Tests rely on DB availability: Consider isolating DB with test containers or providing in-memory/SQLite adapters, or mock Drizzle layer for unit tests to reduce flakiness and CI dependencies.
- CI coverage: Add a CI job to run `npm run lint`, `npm run typecheck`, and `vitest run` (server tests only) with a basic coverage gate (e.g., 70%).
- Monorepo subfolder `realest/`: Exclude from root build/test or convert repository into a proper workspace to scope tasks.

## Low
- Build size: Client bundle ~965 kB (pre-gzip). Explore code-splitting, vendor chunking, and optional imports for large UI libs.
- Health checks: Add a lightweight supertest smoke test hitting `/health` and `/api/health` so validation doesn’t require network.

## Suggested Next Steps
1. Fix Vitest config (setup file + include/exclude) and install missing dev deps.
2. Update server test fixtures to match model types; re-run `npm run typecheck` and `vitest run`.
3. Address top `any` hot spots in client components.
4. Add CI workflow for lint/typecheck/tests and coverage gate.

_Notes:_ Network is restricted in this environment; direct HTTP calls to localhost were not permitted, so server health was verified by startup logs only.


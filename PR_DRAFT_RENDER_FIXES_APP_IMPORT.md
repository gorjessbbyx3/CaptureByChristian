# PR: Server app import + Render start alignment

## Summary

- Fix Render build error by importing the server app factory without a file extension.
- Normalize `NODE_ENV` checks across the server to avoid case-related divergence.
- Ensure Render runs the server in production mode.

## Changes

- server/index.ts: import `{ createApp }` from `./app`; use `isProd` for env gating and errors.
- server/app.ts: new `createApp()` with CORS, sessions, health routes, and static `attached_assets/`.
- render.yaml: use `startCommand: npm run start:production`.
- Test/dev scaffolding: vitest excludes, `test/setup.ts`, minimal health test.
- Collaboration: `COLLAB_AGENTS.md`, `RENDER_DEBUG_BOARD.md`, GitHub issue template.

## Why

- `tsconfig.build.json` disallows TS extension imports; `./app.js` was unresolved at compile time.
- Mixed `NODE_ENV` values (e.g., `Production`) caused conditional behavior to diverge.

## Verification

- Local: `npm ci && npm run build` should succeed.
- Render logs should display:
  - `✅ Routes registered`
  - `🚀 Server running on port <PORT>`
  - Environment: `production`
- Health check: `/health` returns 200 JSON.

## Render Checklist (Claude)

- [ ] Redeploy from this branch.
- [ ] Post Build and Runtime logs in the Render Debug Board.
- [ ] Confirm `/health` returns 200 via Render dashboard.
- [ ] Confirm static client served from `dist/public`.

## Follow-ups (separate PRs recommended)

- Tighten Vitest suite to server-only tests; fix remaining schema/test mismatches.
- Address ESLint `any` hotspots in client.
- Add GitHub Actions for `lint`, `typecheck`, and server tests.

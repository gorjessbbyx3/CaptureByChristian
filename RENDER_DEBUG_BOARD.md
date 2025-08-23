# Render Debug Board

Use this issue-like board to coordinate deployment debugging.

## Context
- Service: `capturedbychristian-app` (web), Node 20
- Build: `npm ci && npm run build`
- Start: `npm start` (env sets `NODE_ENV=production`) — consider `npm run start:production`
- Health: `/health`

## Current Errors
- Looping runtime failures on Render (provide exact log excerpts here).
- Possible env-case drift: logs sometimes show `NODE_ENV: Production` vs code checks for `'production'`.
- Asset path/resolution and health check responses need confirmation in Render logs.

## Hypotheses
- Node env case mismatch -> conditional server behavior (CORS/cookies/static) diverges.
- Health path not returning due to early failure during route registration.
- Static client path misaligned after build copy.

## Next Actions
- [ ] Normalize `NODE_ENV` comparison to lowercase in server.
- [ ] Confirm `startCommand` uses `npm run start:production` in `render.yaml`.
- [ ] Re-deploy and capture full startup logs: expected lines include `✅ Routes registered`, `🚀 Server running`, and `📁 Assets path:`.
- [ ] Hit health check via Render dashboard and record HTTP status/body.

## Verification Checklist
- [ ] Render startup logs show environment as `production` and routes registered.
- [ ] Health check `/health` returns 200 JSON.
- [ ] Static files are served from `dist/public` in production.

## Handoff Log
- Template:
  - Commit/PR:
  - Error excerpt:
  - Hypothesis:
  - Action taken:
  - What to verify next:


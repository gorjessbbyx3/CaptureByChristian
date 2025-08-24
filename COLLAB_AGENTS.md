# Agent Collaboration Guide

This document defines how multiple AI agents (and humans) collaborate on Render deployment fixes without stepping on each other.

## Branching & PR Flow

- Branch: use `render-fixes/<short-scope>` (e.g., `render-fixes/normalize-node-env`).
- PR size: small, single-purpose, clearly titled; link the Render Debug Board item.
- Reviews: at least one review (Claude or this assistant) before merge.

## Handoff Protocol

- Use the Render Debug Board (see `RENDER_DEBUG_BOARD.md`).
- Each handoff comment includes:
  - Context: what changed and why
  - Error excerpt: exact lines from Render logs
  - Hypothesis: suspected cause
  - Next Action: concrete file/command to run
  - Verify: health path or log line expected

## Required Artifacts on Every Attempt

- Build + Runtime logs (copy/paste)
- `render.yaml` snippet (build/start, health path, node version)
- Env snapshot: `NODE_ENV`, `PORT`, `FRONTEND_URL`, `DATABASE_URL`, `SESSION_SECRET`

## Local Repro (mirror Render)

- Build: `npm run render:build`
- Start: `npm run render:start`
- Env: copy `.env.render.example` → `.env.render` and match Render values

## Ownership

- Server runtime/startup, health checks, static paths, env normalization: this assistant
- Client build, asset pipeline, CORS/session alignment, TS/ESLint cleanup: Claude

## Decision Log

- Record key decisions in the Debug Board with commit hash and rationale.

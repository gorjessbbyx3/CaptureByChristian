# Repository Guidelines

## Project Structure & Module Organization

- `server/`: Express API in TypeScript. Entry `index.ts`, routes in `routes.ts`, DB/bootstrap in `database-init.ts`. Tests live here as `*.test.ts`.
- `client/`: React + Vite app. Entry `index.html`, source in `src/`. Dev server runs on `5173`.
- `attached_assets/`: Static uploads and assets, served at `/attached_assets`.
- `dist/`: Build output (`server` JS and `public/` for the built client). Do not edit.
- Root config: `tsconfig*.json`, `vite.config.js/ts`, `drizzle.config.ts`, ESLint/Prettier configs.

## Build, Test, and Development Commands

- `npm run build`: Clean, compile server, build client, copy assets into `dist/`.
- `npm start` / `npm run start:production`: Run compiled server from `dist/server/index.js`.
- `cd client && npm run dev`: Run the client locally (Vite) on `http://localhost:5173`.
- `npm test` | `npm run test:coverage`: Run Vitest (UI, routes, DB) with optional coverage.
- `npm run lint` | `npm run format`: Lint with ESLint, format with Prettier.
- DB: `npm run db:migrate` (initialize/migrate), `npm run db:generate` (drizzle-kit).

## Coding Style & Naming Conventions

- Language: TypeScript (Node 18+). Prefer explicit types at public boundaries.
- Indentation: 2 spaces; keep files focused; named exports where reasonable.
- Filenames: kebab-case for files; tests end with `.test.ts`.
- Tools: ESLint (`@typescript-eslint`) and Prettier. Run `npm run lint` before PRs.

## Testing Guidelines

- Framework: Vitest. Place tests in `server/` as `*.test.ts` (e.g., `routes.test.ts`).
- Style: `describe/it` + `expect`. Mock external services where needed.
- Coverage: Prioritize routes, DB helpers, and error paths. Use `npm run test:coverage`.

## Commit & Pull Request Guidelines

- Commits: Follow Conventional Commits when possible (`feat:`, `fix:`, `chore:`, `docs:`). Scope by area (e.g., `server:`, `client:`).
- PRs: Include a clear description, linked issues, and screenshots/GIFs for UI changes. Ensure CI basics pass: `npm test`, `npm run lint`, and a successful `npm run build`.

## Security & Configuration Tips

- Env: Copy `.env.example` to `.env`/`.env.local`. Required: `DATABASE_URL`, `SESSION_SECRET`, `FRONTEND_URL`, `PORT`.
- Do not commit secrets. CORS is preconfigured for `localhost:5173` in development.
- Static assets live in `attached_assets/`; avoid user-uploaded files in Git.

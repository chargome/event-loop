Event Loop Monorepo

Structure scaffolded for a Deno + Hono API and React + TanStack web app.

- apps/ — future apps (api, web)
- packages/ — shared packages (config, ui, utils)
- docker/ — local infra (Postgres)

Use pnpm workspaces for Node-based packages (web, shared). Deno-based services will live under `apps/` with their own `deno.json`.

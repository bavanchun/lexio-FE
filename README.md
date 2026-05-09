# Lexio

> Master vocabulary, the smart way.

Lexio is a smart vocabulary learning app powered by spaced repetition and AI-driven content generation.

## Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/) (`corepack enable && corepack prepare pnpm@latest --activate`)
- Docker (optional — only needed for backend services in future phases)

## Quick start

```bash
# Install all workspace dependencies
pnpm install

# Start the web app (http://localhost:3000)
pnpm dev
```

## Monorepo structure

```
apps/
  lexio-web/          # Next.js 15 frontend (App Router, TypeScript strict)
services/             # .NET 10 backend microservices (scaffolded in next iteration)
  identity/
  vocabulary/
  learning/
  statistics/
  content/
  notification/
  social/
shared/               # Future shared protos / gRPC contracts
```

## Useful commands

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Start Next.js dev server             |
| `pnpm build`     | Build all workspaces                 |
| `pnpm lint`      | Lint all workspaces                  |
| `pnpm typecheck` | Type-check all workspaces            |
| `pnpm test`      | Run unit tests across all workspaces |
| `pnpm e2e`       | Run Playwright E2E tests             |

## Docker (optional)

```bash
# Start Postgres 17 + Redis 7 (required for backend services in future phases)
docker compose up -d postgres redis
```

## Documentation

- Implementation roadmap: `./plans/`
- Full product specification: `./docs/Lexio_Complete_Documentation.docx`

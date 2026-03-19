# AGENTS.md — Zenit Finance API

This file provides guidance for agentic coding agents working in this repository.

---

## Project Overview

A REST API for a personal finance app built with **Fastify 5**, **TypeScript 5**,
**Prisma 7** (PostgreSQL), **Better Auth**, and **Zod 4**. No test suite exists yet
(Vitest is planned in Phase 6 of the ROADMAP).

---

## Stack

| Concern          | Choice                                              |
|------------------|-----------------------------------------------------|
| Runtime          | Node.js 24 (ESM, `"type": "module"`)                |
| Framework        | Fastify 5 + `fastify-type-provider-zod`             |
| Language         | TypeScript 5 (`strict`, `nodenext` module resolution)|
| ORM              | Prisma 7 with `@prisma/adapter-pg`                  |
| Database         | PostgreSQL 16 (Docker for local dev)                |
| Auth             | Better Auth 1.x (email/password + Google OAuth)     |
| Validation       | Zod 4 (env, route schemas, response shapes)         |
| API Docs         | `@fastify/swagger` + Scalar UI at `/docs`           |
| Linter/Formatter | Biome 2 (replaces both ESLint and Prettier)         |
| Package Manager  | pnpm 10                                             |

---

## Commands

### Development

```bash
# Start the dev server (tsx watch, reads .env automatically)
pnpm dev

# Type-check without emitting
pnpm check-types
```

### Build

```bash
# Compile TypeScript + resolve path aliases
pnpm build          # runs: tsc && tsc-alias

# The prebuild hook runs automatically before build:
# prisma migrate deploy && prisma generate
```

### Start (production)

```bash
pnpm start          # runs: node dist/server.js
```

### Lint & Format

```bash
# Lint the entire project
pnpm lint           # runs: biome check

# Auto-format all files
pnpm format         # runs: biome format --write .
```

### Database

```bash
# Start local PostgreSQL (Docker)
docker compose up -d

# Create and apply a new migration
pnpm prisma migrate dev --name <migration_name>

# Apply pending migrations (used in production build)
pnpm prisma migrate deploy

# Regenerate Prisma Client after schema changes
pnpm prisma generate

# Open Prisma Studio
pnpm prisma studio
```

### Tests

**No test suite is configured yet.** Vitest is planned (ROADMAP Phase 6).
When tests are added, the expected commands will be:

```bash
pnpm test               # run all tests
pnpm test <file_path>   # run a single test file
```

---

## TypeScript Configuration

- **`module` / `moduleResolution`:** `nodenext` — all local imports **must** include
  the `.js` extension even when the source file is `.ts`:
  ```ts
  import { env } from './env.js'         // correct
  import { env } from './env'            // wrong — will fail at runtime
  ```
- **`strict: true`** — all strict checks are enabled; never use `any` implicitly.
- **Path alias:** `@/*` maps to `src/*` (resolved by `tsc-alias` at build time).
  Use `@/` for cross-directory imports within `src/`:
  ```ts
  import { prisma } from '@/lib/prisma.js'
  import { UnauthorizedError } from '@/errors/index.js'
  ```
- Only `src/` is included in compilation. Root-level files like `prisma.config.ts`
  are excluded.

---

## Code Style (enforced by Biome 2)

### Formatting

- **Indent:** 2 spaces (no tabs)
- **Line endings:** LF
- **Line width:** 80 characters
- **Quotes:** single quotes in JS/TS (`'value'`), double quotes in JSX
- **Semicolons:** none (omit trailing semicolons)
- **Trailing commas:** none
- **Import order:** auto-organized by Biome; do not manually reorder imports

Run `pnpm format` to apply all formatting rules automatically.

### Naming Conventions

- **Files:** `kebab-case.ts` (e.g., `error-handler.ts`, `categories.ts`)
- **Variables / functions:** `camelCase`
- **Classes / types / interfaces / enums:** `PascalCase`
- **Constants / env values:** reference via the typed `env` object from `src/env.ts`
- **Route plugin functions:** named exports, `camelCase` (e.g., `categoriesRoutes`)
- **Error classes:** `PascalCase` suffixed with `Error` (e.g., `UnauthorizedError`)

### Imports

- Always use named imports; avoid default imports unless the library only exports default
- Use the `@/` alias for intra-`src/` imports; use relative paths only for
  files in the same directory or one level up
- Include `.js` extension on all local imports (required by `nodenext`)
- `type` keyword is required for type-only imports:
  ```ts
  import type { FastifyInstance } from 'fastify'
  import type { ZodTypeProvider } from 'fastify-type-provider-zod'
  ```

---

## Architecture Patterns

### Route Modules

Each route file exports a named async plugin function registered in `src/server.ts`:

```ts
export function categoriesRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/', {
    schema: {
      operationId: 'getCategories',
      summary: 'List all categories',
      tags: ['Categories'],
      response: {
        200: z.object({ ... }),
        401: errorSchema,
      },
    },
  }, async (request, reply) => {
    // handler
  })
}
```

- Always call `.withTypeProvider<ZodTypeProvider>()` before route definitions
- Always declare `response` schemas for all status codes (enables serialization)
- Always include `operationId`, `summary`, and `tags` in every route schema
- Use `errorSchema` from `@/schemas/index.js` for all error responses

### Authentication

Session validation is performed inline in each route handler using Better Auth:

```ts
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '@/lib/auth.js'
import { UnauthorizedError } from '@/errors/index.js'

const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) })
if (!session) throw new UnauthorizedError()
```

### Error Handling

- Throw custom error classes (defined in `src/errors/index.ts`); do not call
  `reply.send()` directly in route handlers for error responses
- The global error handler in `src/middlewares/error-handler.ts` maps error
  types to HTTP status codes
- All errors sent to the client follow the `errorSchema` shape:
  `{ error: string, code: string }`
- Log unexpected errors with `request.log.error(error)` before returning 500

### Environment Variables

- All env access must go through the validated `env` object from `src/env.ts`
- Never read `process.env` directly anywhere else in `src/`
- Add new variables to both `src/env.ts` (Zod schema) and `.env.example`

### Database

- Import the shared Prisma client from `@/lib/prisma.js`; never instantiate
  `PrismaClient` elsewhere
- Use `@@map` on Prisma models to keep DB table names in `snake_case`
- Generated Prisma client lives in `src/generated/prisma/` (gitignored)
- After any schema change, run `pnpm prisma generate` before building

---

## Environment Setup

1. Copy `.env.example` to `.env` and fill in the secrets
2. Start Postgres: `docker compose up -d`
3. Run migrations: `pnpm prisma migrate dev`
4. Start dev server: `pnpm dev`

Node version is pinned to v24 (see `.nvmrc`). `engine-strict=true` in `.npmrc`
will reject installs on wrong Node versions. Use `nvm use` to switch automatically.

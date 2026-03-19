# AGENTS.md — src/routes/

Guia de padrões para criação e manutenção de rotas neste projeto.

---

## Estrutura de diretórios

Cada endpoint vive em seu próprio arquivo, organizado em subpastas por recurso:

```
src/routes/
├── auth.ts                          # handler especial do Better Auth (wildcard)
├── health.ts                        # GET / — health check
├── categories/
│   ├── index.ts                     # plugin agrupador — registra todas as rotas do recurso
│   ├── get-categories.ts            # GET    /categories
│   ├── create-category.ts           # POST   /categories
│   ├── update-category.ts           # PUT    /categories/:id
│   └── delete-category.ts           # DELETE /categories/:id
└── transactions/
    ├── index.ts                     # plugin agrupador — registra todas as rotas do recurso
    ├── get-transactions.ts          # GET    /transactions
    ├── create-transaction.ts        # POST   /transactions
    ├── update-transaction.ts        # PUT    /transactions/:id
    └── delete-transaction.ts        # DELETE /transactions/:id
```

**Regras:**
- Um arquivo = um único endpoint.
- Nome do arquivo em `kebab-case`, descrevendo a ação + recurso
  (ex.: `create-transaction.ts`, `delete-category.ts`).
- Novos recursos ganham uma nova subpasta com o nome do recurso no plural.
- Cada subpasta **deve** ter um `index.ts` (plugin agrupador).

---

## Anatomia de um arquivo de rota

```ts
import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '@/errors/index.js'
import { auth } from '@/lib/auth.js'
import { prisma } from '@/lib/prisma.js'
import { errorSchema } from '@/schemas/index.js'

// Nome da função exportada = camelCase da ação + recurso no singular
export function createTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        operationId: 'createTransaction',   // obrigatório — único globalmente
        summary: 'Descrição curta do endpoint',
        tags: ['Transactions'],             // PascalCase, nome do recurso no plural
        body: z.object({ ... }),            // presente apenas em POST / PUT / PATCH
        params: z.object({ id: z.uuid() }), // presente apenas em rotas com parâmetros
        response: {
          201: z.object({ message: z.string() }),
          401: errorSchema                  // sempre incluir para rotas autenticadas
        }
      }
    },
    async (request, reply) => {
      // 1. Validar sessão (em toda rota autenticada)
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers)
      })
      if (!session) throw new UnauthorizedError()

      // 2. Lógica de negócio (usar prisma da lib compartilhada)

      // 3. Retornar resposta
      return reply.status(201).send({ message: '...' })
    }
  )
}
```

---

## Plugin agrupador (`index.ts`)

Cada subpasta de recurso possui um `index.ts` que importa e registra todos os
endpoints do recurso em um único plugin Fastify. O `prefix` é aplicado uma
única vez no `server.ts`, mantendo-o estável mesmo quando novos endpoints são
adicionados.

```ts
// src/routes/transactions/index.ts
import type { FastifyInstance } from 'fastify'
import { createTransaction } from './create-transaction.js'
import { deleteTransaction } from './delete-transaction.js'
import { getTransactions } from './get-transactions.js'
import { updateTransaction } from './update-transaction.js'

export function transactionsRoutes(app: FastifyInstance) {
  app.register(getTransactions)
  app.register(createTransaction)
  app.register(updateTransaction)
  app.register(deleteTransaction)
}
```

Note que os `app.register()` internos **não** recebem `prefix` — o prefix do
recurso é definido apenas no `server.ts`:

```ts
// src/server.ts — um registro por recurso, independente da quantidade de endpoints
await app.register(categoriesRoutes, { prefix: '/categories' })
await app.register(transactionsRoutes, { prefix: '/transactions' })
```

Ao adicionar um novo endpoint:
1. Crie o arquivo na subpasta correta (ex.: `src/routes/transactions/get-transaction-by-id.ts`).
2. Importe e registre-o no `index.ts` da subpasta.
3. O `server.ts` **não precisa ser alterado**.

---

## Regras obrigatórias

| Item | Regra |
|---|---|
| `withTypeProvider<ZodTypeProvider>()` | Sempre chamar antes de definir a rota |
| `operationId` | Obrigatório, único em toda a API, camelCase |
| `summary` | Obrigatório em todas as rotas |
| `tags` | Obrigatório — agrupa rotas no Swagger/Scalar |
| `response` | Declarar todos os status codes retornáveis |
| Erros | Lançar classes de erro de `@/errors/index.js`; nunca `reply.send()` direto para erros |
| Autenticação | Verificar sessão inline com `auth.api.getSession` no início do handler |
| Prisma | Sempre importar de `@/lib/prisma.js`; nunca instanciar `PrismaClient` direto |
| Imports | Extensão `.js` obrigatória em todos os imports locais (exigência do `nodenext`) |
| `errorSchema` | Usar de `@/schemas/index.js` para todos os status codes de erro |

---

## Autenticação

Toda rota que exige usuário logado deve validar a sessão no início do handler:

```ts
const session = await auth.api.getSession({
  headers: fromNodeHeaders(request.headers)
})
if (!session) throw new UnauthorizedError()
```

Use sempre `session.user.id` para filtrar/associar dados ao usuário logado
(nunca confiar em IDs vindos do body ou params para ownership).

---

## Convenções de resposta

| Situação | Status |
|---|---|
| Recurso criado | `201` + `{ message: string }` |
| Leitura / atualização / deleção | `200` + payload relevante ou `{ message: string }` |
| Não autenticado | `401` — lançar `UnauthorizedError` |
| Erro de validação (Zod) | `400` — tratado automaticamente pelo error handler |
| Erro inesperado | `500` — tratado pelo error handler global |

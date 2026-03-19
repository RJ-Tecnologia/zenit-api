import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '@/errors/index.js'
import { TransactionType } from '@/generated/prisma/enums.js'
import { auth } from '@/lib/auth.js'
import { prisma } from '@/lib/prisma.js'
import { errorSchema } from '@/schemas/index.js'

export function getTransactions(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        operationId: 'getAllTransactions',
        summary: 'Lista todas as movimentações (transações) do usuário logado',
        tags: ['Transactions'],
        response: {
          200: z.object({
            transactions: z.array(
              z.object({
                id: z.uuid(),
                title: z.string(),
                description: z.string().nullable(),
                type: z.enum(TransactionType),
                amount: z.coerce.number(),
                date: z.date(),
                categoryId: z.uuid()
              })
            )
          }),
          401: errorSchema
        }
      }
    },
    async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers)
      })

      if (!session) {
        throw new UnauthorizedError()
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: session.user.id
        }
      })

      return reply.status(200).send({
        transactions
      })
    }
  )
}

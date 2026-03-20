import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { TransactionType } from '@/generated/prisma/enums.js'
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
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: request.session.user.id
        }
      })

      return reply.status(200).send({
        transactions
      })
    }
  )
}

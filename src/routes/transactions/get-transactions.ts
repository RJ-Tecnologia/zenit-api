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
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(100).default(20)
        }),
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
            ),
            meta: z.object({
              total: z.number(),
              perPage: z.number(),
              currentPage: z.number(),
              lastPage: z.number()
            })
          }),
          401: errorSchema
        }
      }
    },
    async (request, reply) => {
      const { page, limit } = request.query
      const skip = (page - 1) * limit

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where: {
            userId: request.session.user.id
          },
          orderBy: {
            date: 'desc'
          },
          take: limit,
          skip
        }),
        prisma.transaction.count({
          where: {
            userId: request.session.user.id
          }
        })
      ])

      const lastPage = Math.ceil(total / limit)

      return reply.status(200).send({
        transactions,
        meta: {
          total,
          perPage: limit,
          currentPage: page,
          lastPage
        }
      })
    }
  )
}

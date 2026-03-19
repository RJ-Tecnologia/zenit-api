import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '@/errors/index.js'
import { TransactionType } from '@/generated/prisma/enums.js'
import { auth } from '@/lib/auth.js'
import { prisma } from '@/lib/prisma.js'
import { errorSchema } from '@/schemas/index.js'

export function updateTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/:id',
    {
      schema: {
        operationId: 'updateTransaction',
        summary: 'Atualiza uma movimentação',
        tags: ['Transactions'],
        params: z.object({
          id: z.uuid()
        }),
        body: z.object({
          title: z.string(),
          description: z.string().optional(),
          type: z.enum(TransactionType),
          amount: z.number(),
          date: z.iso.date(),
          categoryId: z.uuid()
        }),
        response: {
          200: z.object({
            message: z.string()
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

      const { body } = request

      await prisma.transaction.update({
        where: {
          id: request.params.id,
          userId: session.user.id
        },
        data: {
          title: body.title,
          amount: body.amount,
          date: body.date,
          type: body.type,
          description: body.description,
          categoryId: body.categoryId
        }
      })

      return reply.status(200).send({
        message: 'Transaction updated!'
      })
    }
  )
}

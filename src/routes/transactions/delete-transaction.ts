import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '@/errors/index.js'
import { auth } from '@/lib/auth.js'
import { prisma } from '@/lib/prisma.js'
import { errorSchema } from '@/schemas/index.js'

export function deleteTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      schema: {
        operationId: 'deleteTransaction',
        summary: 'Deleta uma movimentação',
        tags: ['Transactions'],
        params: z.object({
          id: z.uuid()
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

      await prisma.transaction.delete({
        where: {
          id: request.params.id,
          userId: session.user.id
        }
      })

      return reply.status(200).send({
        message: 'Transaction deleted!'
      })
    }
  )
}

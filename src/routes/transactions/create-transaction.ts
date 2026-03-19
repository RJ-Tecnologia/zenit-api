import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '@/errors/index.js'
import { TransactionType } from '@/generated/prisma/enums.js'
import { auth } from '@/lib/auth.js'
import { prisma } from '@/lib/prisma.js'
import { errorSchema } from '@/schemas/index.js'

export function createTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        operationId: 'createTransaction',
        summary: 'Cria uma nova movimentação',
        tags: ['Transactions'],
        body: z.object({
          title: z.string(),
          description: z.string().optional(),
          type: z.enum(TransactionType),
          amount: z.number(),
          date: z.iso.datetime(),
          categoryId: z.uuid()
        }),
        response: {
          201: z.object({
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

      await prisma.transaction.create({
        data: {
          title: body.title,
          amount: body.amount,
          date: body.date,
          type: body.type,
          description: body.description,
          categoryId: body.categoryId,
          userId: session.user.id
        }
      })

      return reply.status(201).send({
        message: 'Transaction registered!'
      })
    }
  )
}

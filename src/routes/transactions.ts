import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '@/errors/index.js'
import { TransactionType } from '@/generated/prisma/enums.js'
import { auth } from '@/lib/auth.js'
import { prisma } from '@/lib/prisma.js'
import { errorSchema } from '@/schemas/index.js'

export function transactionsRoutes(app: FastifyInstance) {
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
          date: z.date(),
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
          date: z.date(),
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

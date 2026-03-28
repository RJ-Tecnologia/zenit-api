import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { errorSchema, transactionsSummarySchema } from '@/schemas/index.js'
import { getTransactionsSummaryUseCase } from '@/use-cases/get-transactions-summary.js'

export function getTransactionsSummary(app: FastifyInstance) {
  return app.withTypeProvider<ZodTypeProvider>().get(
    '/summary',
    {
      schema: {
        operationId: 'getTransactionsSummary',
        summary: 'Retorna informações sobre as transações do usuário',
        tags: ['Transactions'],
        querystring: z.object({
          startDate: z.iso.date(),
          endDate: z.iso.date()
        }),
        response: {
          200: transactionsSummarySchema,
          401: errorSchema
        }
      }
    },
    async (request, reply) => {
      const { startDate, endDate } = request.query

      const summary = await getTransactionsSummaryUseCase({
        userId: request.session.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      })

      return reply.status(200).send(summary)
    }
  )
}

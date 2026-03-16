import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export function healthCheckRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '',
    {
      schema: {
        summary: 'Health check',
        response: {
          200: z.object({
            message: z.string()
          })
        }
      }
    },
    async (_, reply) => {
      return reply.status(200).send({
        message: 'API is running!'
      })
    }
  )
}

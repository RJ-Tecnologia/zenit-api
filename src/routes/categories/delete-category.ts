import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '@/lib/prisma.js'
import { errorSchema } from '@/schemas/index.js'

export function deleteCategory(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      schema: {
        operationId: 'deleteCategory',
        summary: 'Deleta uma categoria',
        tags: ['Categories'],
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
      const { id } = request.params

      await prisma.category.delete({
        where: {
          id,
          userId: request.session.user.id
        }
      })

      return reply.status(200).send({
        message: 'Category deleted!'
      })
    }
  )
}

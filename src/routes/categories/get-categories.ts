import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { CategoryScope } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'
import { errorSchema } from '@/schemas/index.js'

export function getCategories(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        operationId: 'getAllCategories',
        summary: 'Lista todas as categorias do usuário logado',
        tags: ['Categories'],
        response: {
          200: z.object({
            categories: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                scope: z.enum(CategoryScope)
              })
            )
          }),
          401: errorSchema
        }
      }
    },
    async (request, reply) => {
      const categories = await prisma.category.findMany({
        where: {
          userId: request.session.user.id
        }
      })

      return reply.status(200).send({
        categories
      })
    }
  )
}

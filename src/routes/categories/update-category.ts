import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ItemAlreadyExists } from '@/errors/index.js'
import { CategoryScope } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'
import { errorSchema } from '@/schemas/index.js'

export function updateCategory(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/:id',
    {
      schema: {
        operationId: 'updateCategory',
        summary: 'Atualiza uma categoria',
        tags: ['Categories'],
        params: z.object({
          id: z.uuid()
        }),
        body: z.object({
          name: z.string(),
          scope: z.enum(CategoryScope).default('BOTH')
        }),
        response: {
          200: z.object({
            message: z.string()
          }),
          401: errorSchema,
          409: errorSchema
        }
      }
    },
    async (request, reply) => {
      const { id } = request.params
      const { name, scope } = request.body

      const hasCategoryWithSameName = await prisma.category.findFirst({
        where: {
          id: {
            not: id
          },
          name: {
            equals: name,
            mode: 'insensitive'
          },
          userId: request.session.user.id
        }
      })

      if (hasCategoryWithSameName) {
        throw new ItemAlreadyExists(
          `There is already a category with the name '${name}'`
        )
      }

      await prisma.category.update({
        where: {
          id,
          userId: request.session.user.id
        },
        data: {
          name,
          scope
        }
      })

      return reply.status(200).send({
        message: 'Category updated!'
      })
    }
  )
}

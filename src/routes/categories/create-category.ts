import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { ItemAlreadyExists } from '@/errors/index.js'
import { CategoryScope } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'
import { errorSchema } from '@/schemas/index.js'

export function createCategory(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        operationId: 'createCategory',
        summary: 'Cria uma nova categoria',
        tags: ['Categories'],
        body: z.object({
          name: z.string(),
          scope: z.enum(CategoryScope).default('BOTH')
        }),
        response: {
          201: z.object({
            message: z.string()
          }),
          401: errorSchema,
          409: errorSchema
        }
      }
    },
    async (request, reply) => {
      const { name, scope } = request.body

      const hasCategoryWithSameName = await prisma.category.findFirst({
        where: {
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

      await prisma.category.create({
        data: {
          name,
          scope,
          userId: request.session.user.id
        }
      })

      return reply.status(201).send({
        message: 'Category registered!'
      })
    }
  )
}

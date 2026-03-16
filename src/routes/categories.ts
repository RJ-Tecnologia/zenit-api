import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '@/errors/index.js'
import { CategoryScope } from '@/generated/prisma/enums.js'
import { auth } from '@/lib/auth.js'
import { prisma } from '@/lib/prisma.js'
import { errorSchema } from '@/schemas/index.js'

export function categoriesRoutes(app: FastifyInstance) {
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
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers)
      })

      if (!session) {
        throw new UnauthorizedError()
      }

      const categories = await prisma.category.findMany({
        where: {
          userId: session.user.id
        }
      })

      return reply.status(200).send({
        categories
      })
    }
  )

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

      const { name, scope } = request.body

      await prisma.category.create({
        data: {
          name,
          scope,
          userId: session.user.id
        }
      })

      return reply.status(201).send({
        message: 'Category registered!'
      })
    }
  )

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

      const { id } = request.params
      const { name, scope } = request.body

      await prisma.category.update({
        where: {
          id,
          userId: session.user.id
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
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers)
      })

      if (!session) {
        throw new UnauthorizedError()
      }

      const { id } = request.params

      await prisma.category.delete({
        where: {
          id,
          userId: session.user.id
        }
      })

      return reply.status(200).send({
        message: 'Category deleted!'
      })
    }
  )
}

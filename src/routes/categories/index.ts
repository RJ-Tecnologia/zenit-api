import type { FastifyInstance } from 'fastify'
import { createCategory } from './create-category.js'
import { deleteCategory } from './delete-category.js'
import { getCategories } from './get-categories.js'
import { updateCategory } from './update-category.js'

export function categoriesRoutes(app: FastifyInstance) {
  app.register(getCategories)
  app.register(createCategory)
  app.register(updateCategory)
  app.register(deleteCategory)
}

import type { FastifyInstance } from 'fastify'
import { createTransaction } from './create-transaction.js'
import { deleteTransaction } from './delete-transaction.js'
import { getTransactions } from './get-transactions.js'
import { updateTransaction } from './update-transaction.js'

export function transactionsRoutes(app: FastifyInstance) {
  app.register(getTransactions)
  app.register(createTransaction)
  app.register(updateTransaction)
  app.register(deleteTransaction)
}

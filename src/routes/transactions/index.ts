import type { FastifyInstance } from 'fastify'
import { authenticate } from '@/hooks/authenticate.js'
import { createTransaction } from './create-transaction.js'
import { deleteTransaction } from './delete-transaction.js'
import { getTransactionsSummary } from './get-summary.js'
import { getTransactions } from './get-transactions.js'
import { updateTransaction } from './update-transaction.js'

export function transactionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)
  app.register(getTransactionsSummary)
  app.register(getTransactions)
  app.register(createTransaction)
  app.register(updateTransaction)
  app.register(deleteTransaction)
}

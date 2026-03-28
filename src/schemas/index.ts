import z from 'zod'
import { TransactionType } from '@/generated/prisma/enums.js'

export const errorSchema = z.object({
  error: z.string(),
  code: z.string()
})

export const categorySummarySchema = z.object({
  name: z.string(),
  percentage: z.number(),
  amount: z.number()
})

export const transactionsSummarySchema = z.object({
  balance: z.number(),
  income: z.number(),
  outcome: z.number(),
  transactionsCount: z.number(),
  lastTransactions: z.array(
    z.object({
      id: z.uuid(),
      title: z.string(),
      date: z.string(),
      amount: z.number(),
      category: z.string(),
      type: z.enum(TransactionType)
    })
  ),
  outcomeCategoriesSummary: z.array(categorySummarySchema),
  incomeCategoriesSummary: z.array(categorySummarySchema),
  balanceChangePercentage: z.number().nullable(),
  incomeChangePercentage: z.number().nullable(),
  outcomeChangePercentage: z.number().nullable(),
  transactionsCountChangePercentage: z.number().nullable()
})

export type TransactionsSummary = z.infer<typeof transactionsSummarySchema>

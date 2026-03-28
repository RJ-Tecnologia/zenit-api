import { endOfMonth, startOfMonth, subMonths } from 'date-fns'
import { prisma } from '@/lib/prisma.js'
import type { TransactionsSummary } from '@/schemas/index.js'

interface GetTransactionsSummaryUseCaseProps {
  userId: string
  startDate: Date
  endDate: Date
}

function calcPercentageChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

export async function getTransactionsSummaryUseCase({
  userId,
  startDate,
  endDate
}: GetTransactionsSummaryUseCaseProps): Promise<TransactionsSummary> {
  const previousMonth = subMonths(startDate, 1)
  const previousStartDate = startOfMonth(previousMonth)
  const previousEndDate = endOfMonth(previousMonth)

  const [transactions, previousTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        user: { id: userId },
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'desc' },
      include: { category: { select: { name: true } } }
    }),
    prisma.transaction.findMany({
      where: {
        user: { id: userId },
        date: { gte: previousStartDate, lte: previousEndDate }
      },
      select: { type: true, amount: true }
    })
  ])

  const { income, outcome } = transactions.reduce(
    (acc, current) => {
      if (current.type === 'INCOME') {
        return {
          income: acc.income + current.amount.toNumber(),
          outcome: acc.outcome
        }
      }

      return {
        income: acc.income,
        outcome: acc.outcome + current.amount.toNumber()
      }
    },
    { income: 0, outcome: 0 }
  )

  const hasPreviousData = previousTransactions.length > 0

  const { income: prevIncome, outcome: prevOutcome } =
    previousTransactions.reduce(
      (acc, current) => {
        if (current.type === 'INCOME') {
          return {
            income: acc.income + current.amount.toNumber(),
            outcome: acc.outcome
          }
        }
        return {
          income: acc.income,
          outcome: acc.outcome + current.amount.toNumber()
        }
      },
      { income: 0, outcome: 0 }
    )

  const prevBalance = prevIncome - prevOutcome

  const lastTransactions = transactions.slice(0, 5).map((transaction) => {
    return {
      id: transaction.id,
      title: transaction.title,
      amount: transaction.amount.toNumber(),
      category: transaction.category.name,
      type: transaction.type,
      date: transaction.date.toISOString()
    }
  })

  const outcomeCategoriesSummary = Object.values(
    transactions
      .filter((transaction) => transaction.type === 'OUTCOME')
      .reduce<Record<string, { name: string; amount: number }>>(
        (acc, transaction) => {
          const categoryName = transaction.category.name
          const amount = transaction.amount.toNumber()

          if (acc[categoryName]) {
            acc[categoryName].amount += amount
          } else {
            acc[categoryName] = { name: categoryName, amount }
          }

          return acc
        },
        {}
      )
  )
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map((category) => ({
      name: category.name,
      amount: category.amount,
      percentage:
        outcome > 0 ? Math.round((category.amount / outcome) * 100) : 0
    }))

  const incomeCategoriesSummary = Object.values(
    transactions
      .filter((transaction) => transaction.type === 'INCOME')
      .reduce<Record<string, { name: string; amount: number }>>(
        (acc, transaction) => {
          const categoryName = transaction.category.name
          const amount = transaction.amount.toNumber()

          if (acc[categoryName]) {
            acc[categoryName].amount += amount
          } else {
            acc[categoryName] = { name: categoryName, amount }
          }

          return acc
        },
        {}
      )
  )
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map((category) => ({
      name: category.name,
      amount: category.amount,
      percentage: income > 0 ? Math.round((category.amount / income) * 100) : 0
    }))

  return {
    balance: income - outcome,
    income,
    outcome,
    transactionsCount: transactions.length,
    lastTransactions,
    outcomeCategoriesSummary,
    incomeCategoriesSummary,
    balanceChangePercentage: hasPreviousData
      ? calcPercentageChange(income - outcome, prevBalance)
      : null,
    incomeChangePercentage: hasPreviousData
      ? calcPercentageChange(income, prevIncome)
      : null,
    outcomeChangePercentage: hasPreviousData
      ? calcPercentageChange(outcome, prevOutcome)
      : null,
    transactionsCountChangePercentage: hasPreviousData
      ? calcPercentageChange(transactions.length, previousTransactions.length)
      : null
  }
}

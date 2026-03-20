import type { CategoryScope } from '@/generated/prisma/client.js'

interface DefaultCategory {
  name: string
  scope: CategoryScope
}

export const defaultCategories: DefaultCategory[] = [
  { name: 'Salário', scope: 'INCOME' },
  { name: 'Freelance', scope: 'INCOME' },
  { name: 'Investimentos', scope: 'BOTH' },
  { name: 'Moradia', scope: 'OUTCOME' },
  { name: 'Alimentação', scope: 'OUTCOME' },
  { name: 'Transporte', scope: 'OUTCOME' },
  { name: 'Saúde', scope: 'OUTCOME' },
  { name: 'Educação', scope: 'OUTCOME' },
  { name: 'Lazer', scope: 'OUTCOME' },
  { name: 'Internet', scope: 'OUTCOME' },
  { name: 'Luz', scope: 'OUTCOME' },
  { name: 'Água', scope: 'OUTCOME' }
]

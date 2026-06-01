import type { CategoryScope } from '@/generated/prisma/client.js'
import type { CategoryIcon } from './icons.js'

interface DefaultCategory {
  name: string
  scope: CategoryScope
  icon: CategoryIcon
}

export const defaultCategories: DefaultCategory[] = [
  { name: 'Salário', scope: 'INCOME', icon: 'wallet' },
  { name: 'Freelance', scope: 'INCOME', icon: 'laptop' },
  { name: 'Investimentos', scope: 'BOTH', icon: 'trending-up' },
  { name: 'Moradia', scope: 'OUTCOME', icon: 'home' },
  { name: 'Alimentação', scope: 'OUTCOME', icon: 'utensils' },
  { name: 'Transporte', scope: 'OUTCOME', icon: 'car' },
  { name: 'Saúde', scope: 'OUTCOME', icon: 'heart' },
  { name: 'Educação', scope: 'OUTCOME', icon: 'graduation-cap' },
  { name: 'Lazer', scope: 'OUTCOME', icon: 'smile' },
  { name: 'Internet', scope: 'OUTCOME', icon: 'wifi' },
  { name: 'Luz', scope: 'OUTCOME', icon: 'zap' },
  { name: 'Água', scope: 'OUTCOME', icon: 'droplet' }
]

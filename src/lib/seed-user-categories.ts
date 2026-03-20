import { prisma } from '@/lib/prisma.js'
import { defaultCategories } from './default-categories.js'

export async function seedUserCategories(userId: string): Promise<void> {
  await prisma.category.createMany({
    data: defaultCategories.map((category) => ({
      ...category,
      userId
    })),
    skipDuplicates: true
  })
}

import { hashPassword } from 'better-auth/crypto'
import { prisma } from './lib/prisma.js'

async function seed() {
  console.log('🌱 Starting seed...')

  // 1. Clear database
  console.log('🧹 Clearing database...')
  await prisma.transaction.deleteMany()
  await prisma.category.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // 2. Create default user
  console.log('👤 Creating default user...')
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'test@example.com'
    }
  })

  // 3. Create account for authentication
  console.log('🔐 Creating account for authentication...')
  const password = 'password123'
  const hashedPassword = await hashPassword(password)

  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      userId: user.id,
      accountId: user.id, // Better Auth standard: usually matches user ID for email/password
      providerId: 'email',
      password: hashedPassword
    }
  })

  console.log(
    `✅ User created with email: test@example.com and password: ${password}`
  )

  // 4. Create 30 categories
  console.log('📂 Creating categories...')
  const scopes = ['INCOME', 'OUTCOME', 'BOTH'] as const
  const categoryPromises = Array.from({ length: 30 }).map((_, i) => {
    return prisma.category.create({
      data: {
        name: `Category ${i + 1}`,
        userId: user.id,
        scope: scopes[i % scopes.length]
      }
    })
  })
  const categories = await Promise.all(categoryPromises)

  // 4. Create 25 transactions
  console.log('💸 Creating transactions...')
  const transactionPromises = Array.from({ length: 25 }).map((_, i) => {
    const category = categories[i % categories.length]
    const type =
      category.scope === 'BOTH'
        ? i % 2 === 0
          ? 'INCOME'
          : 'OUTCOME'
        : (category.scope as 'INCOME' | 'OUTCOME')

    return prisma.transaction.create({
      data: {
        title: `Transaction ${i + 1}`,
        amount: (Math.random() * 1000 + 1).toFixed(2),
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // One per day backwards
        userId: user.id,
        categoryId: category.id,
        type
      }
    })
  })
  await Promise.all(transactionPromises)

  console.log('✅ Seed finished successfully!')
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e)
  process.exit(1)
})

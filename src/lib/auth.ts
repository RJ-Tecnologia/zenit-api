import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { openAPI } from 'better-auth/plugins'
import { env } from '@/env.js'
import { prisma } from './prisma.js'
import { seedUserCategories } from './seed-user-categories.js'

export const auth = betterAuth({
  baseURL: env.API_BASE_URL,
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    }
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await seedUserCategories(user.id)
        }
      }
    }
  },
  plugins: [openAPI()]
})

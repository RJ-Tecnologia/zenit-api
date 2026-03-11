import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { env } from '@/env.js'
import { prisma } from './prisma.js'

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
  })
})

import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { env } from './src/env.js'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx src/seed.ts'
  },
  datasource: {
    url: env.DATABASE_URL
  }
})

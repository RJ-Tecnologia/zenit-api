import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifyApiReference from '@scalar/fastify-api-reference'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from 'fastify-type-provider-zod'
import type { UserSession } from './@types/fastify.js'
import { env } from './env.js'
import { errorHandler } from './middlewares/error-handler.js'
import { authRoute } from './routes/auth.js'
import { categoriesRoutes } from './routes/categories/index.js'
import { healthCheckRoute } from './routes/health.js'
import { transactionsRoutes } from './routes/transactions/index.js'

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  },
  production: true,
  test: false
}

const app = fastify({
  logger: envToLogger[env.NODE_ENV]
})

app.decorateRequest('session', null as unknown as UserSession)

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Zenit Finance',
      description: 'API REST do projeto Zenit Finance',
      version: '1.0.0'
    },
    servers: [
      {
        description: 'Local',
        url: 'http://localhost:8080'
      },
      {
        description: 'Prod',
        url: 'https://api.zenitfinace.com.br'
      }
    ]
  },
  transform: jsonSchemaTransform
})

await app.register(fastifyCors, {
  origin: [env.FRONTEND_URL],
  credentials: true
})

await app.register(fastifyApiReference, {
  routePrefix: '/docs',
  configuration: {
    theme: 'bluePlanet',
    sources: [
      {
        title: 'Zenit Finance API',
        slug: 'zenit-finance-api',
        url: '/swagger.json'
      },
      {
        title: 'Auth API',
        slug: 'auth-api',
        url: '/api/auth/open-api/generate-schema'
      }
    ]
  }
})

app.setErrorHandler(errorHandler)

await app.register(healthCheckRoute, { prefix: '/' })

await app.register(categoriesRoutes, { prefix: '/categories' })
await app.register(transactionsRoutes, { prefix: '/transactions' })

app.withTypeProvider<ZodTypeProvider>().get(
  '/swagger.json',
  {
    schema: {
      hide: true
    }
  },
  async () => {
    return app.swagger()
  }
)

app.register(authRoute)

try {
  await app.listen({ host: '0.0.0.0', port: env.PORT })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}

import fastify from 'fastify'
import { env } from './env.js'

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

app.get('/', () => {
  return {
    message: 'API is running!'
  }
})

try {
  await app.listen({ host: '0.0.0.0', port: env.PORT })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}

import type { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../errors/index.js'

type HttpError = Error & { statusCode?: number }

export const errorHandler = (
  error: HttpError,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  if (error.statusCode === 400) {
    reply.status(400).send({
      error: error.message,
      code: 'VALIDATION_ERROR'
    })
    return
  }

  if (error instanceof UnauthorizedError) {
    reply.status(403).send({ error: error.message, code: 'FORBIDDEN' })
    return
  }

  request.log.error(error)
  reply.status(500).send({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR'
  })
}

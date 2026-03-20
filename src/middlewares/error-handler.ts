import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  InvalidCategory,
  ItemAlreadyExists,
  UnauthorizedError
} from '../errors/index.js'

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

  if (error instanceof ItemAlreadyExists) {
    reply
      .status(409)
      .send({ error: error.message, code: 'ITEM_ALREADY_EXISTS' })
    return
  }

  if (error instanceof InvalidCategory) {
    reply.status(409).send({ error: error.message, code: 'INVALID_CATEGORY' })
    return
  }

  request.log.error(error)
  reply.status(500).send({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR'
  })
}

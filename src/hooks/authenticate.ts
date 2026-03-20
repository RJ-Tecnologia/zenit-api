import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '@/errors/index.js'
import { auth } from '@/lib/auth.js'

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const result = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers)
  })

  if (!result) {
    throw new UnauthorizedError()
  }

  request.session = result
}

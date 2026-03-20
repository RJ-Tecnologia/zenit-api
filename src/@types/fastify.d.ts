/** biome-ignore-all lint/correctness/noUnusedImports: It is necessary for typing. */

import type { Session, User } from 'better-auth'
import type { FastifyRequest } from 'fastify'

export interface UserSession {
  session: Session
  user: User
}

declare module 'fastify' {
  interface FastifyRequest {
    session: UserSession
  }
}

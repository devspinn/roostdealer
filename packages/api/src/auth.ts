import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createDb } from '@roostdealer/db'
import type { Env } from './app'

export function createAuth(env: Env) {
  const db = createDb(env.DATABASE_URL)
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: [
      'http://localhost:5173',
      'https://roostdealer.com',
      'https://www.roostdealer.com',
    ],
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: '.roostdealer.com',
      },
    },
  })
}

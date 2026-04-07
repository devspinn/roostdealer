import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createDb } from '@roostdealer/db'
import type { Env } from './app'

// Workers-compatible password hashing using Web Crypto PBKDF2
// (bcrypt exceeds Workers' 10ms CPU limit)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  )
  const hashHex = [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('')
  const saltHex = [...salt].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `pbkdf2:100000:${saltHex}:${hashHex}`
}

async function verifyPassword(hash: string, password: string): Promise<boolean> {
  const parts = hash.split(':')
  if (parts[0] !== 'pbkdf2') return false
  const iterations = parseInt(parts[1])
  const salt = new Uint8Array(parts[2].match(/.{2}/g)!.map((b) => parseInt(b, 16)))
  const expectedHash = parts[3]
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256
  )
  const hashHex = [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('')
  const a = new TextEncoder().encode(hashHex)
  const b = new TextEncoder().encode(expectedHash)
  if (a.length !== b.length) return false
  return crypto.subtle.timingSafeEqual(a, b)
}

export function createAuth(env: Env) {
  const db = createDb(env.DATABASE_URL)
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      password: {
        hash: hashPassword,
        verify: ({ hash, password }) => verifyPassword(hash, password),
      },
    },
    user: {
      additionalFields: {
        dealerId: {
          type: 'string',
          required: false,
          input: false,
        },
      },
    },
    trustedOrigins: [
      'http://localhost:5173',
      'https://roostdealer.com',
      'https://www.roostdealer.com',
      'https://roostdealer-web.pages.dev',
    ],
    advanced: {
      // TODO: Re-enable once api.roostdealer.com DNS is configured
      // crossSubDomainCookies: {
      //   enabled: true,
      //   domain: '.roostdealer.com',
      // },
      defaultCookieAttributes: {
        sameSite: 'none',
        secure: true,
      },
    },
  })
}

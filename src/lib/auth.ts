import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/db/drizzle'
import { redis } from './redis'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
  },
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key)
      return value
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        // TTL em segundos
        await redis.set(key, value, { EX: ttl })
      } else {
        await redis.set(key, value)
      }
    },
    delete: async (key) => {
      await redis.del(key)
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // Atualiza a cada 24h
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache de 5 minutos
    },
  },
})

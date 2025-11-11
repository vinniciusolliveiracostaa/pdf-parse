import { redis } from './redis'

/**
 * Cache helper functions para uso geral no sistema
 */

export const cache = {
  /**
   * Busca um valor do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error)
      return null
    }
  },

  /**
   * Define um valor no cache com TTL opcional
   * @param key - Chave do cache
   * @param value - Valor a ser armazenado
   * @param ttl - Time to live em segundos (padrão: 5 minutos)
   */
  async set(key: string, value: unknown, ttl: number = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      if (ttl > 0) {
        await redis.set(key, serialized, { EX: ttl })
      } else {
        await redis.set(key, serialized)
      }
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error)
    }
  },

  /**
   * Remove um valor do cache
   */
  async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error)
    }
  },

  /**
   * Remove múltiplas chaves do cache
   */
  async delMany(keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        await redis.del(keys)
      }
    } catch (error) {
      console.error(`Cache DEL MANY error:`, error)
    }
  },

  /**
   * Remove todos os dados do cache que começam com um prefixo
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(keys)
      }
    } catch (error) {
      console.error(`Cache DEL PATTERN error for ${pattern}:`, error)
    }
  },

  /**
   * Verifica se uma chave existe no cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error)
      return false
    }
  },

  /**
   * Define TTL para uma chave existente
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await redis.expire(key, ttl)
    } catch (error) {
      console.error(`Cache EXPIRE error for key ${key}:`, error)
    }
  },
}

/**
 * Helper para criar uma função com cache automático
 * @param key - Chave do cache ou função que gera a chave
 * @param fn - Função assíncrona que busca os dados
 * @param ttl - Time to live em segundos
 */
export async function cachedFn<T>(
  key: string | (() => string),
  fn: () => Promise<T>,
  ttl: number = 300,
): Promise<T> {
  const cacheKey = typeof key === 'function' ? key() : key

  // Tenta buscar do cache
  const cached = await cache.get<T>(cacheKey)
  if (cached !== null) {
    return cached
  }

  // Se não existe, executa a função
  const result = await fn()

  // Salva no cache
  await cache.set(cacheKey, result, ttl)

  return result
}

/**
 * Prefixos de cache para organização
 */
export const CacheKeys = {
  SESSION: (id: string) => `session:${id}`,
  USER: (id: string) => `user:${id}`,
  LEILAO: (id: string) => `leilao:${id}`,
  LEILOES_LIST: 'leiloes:list',
  CATALOGOS: (leilaoId: string) => `catalogos:${leilaoId}`,
  RELATORIOS: (leilaoId: string) => `relatorios:${leilaoId}`,
  STATS: 'stats:dashboard',
  SETTINGS: 'settings:system',
} as const

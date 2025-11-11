import { createClient } from 'redis'

const redisUrl = process.env.REDIS_URL || 'redis://:redis_password@localhost:6379'

export const redis = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis: Too many reconnect attempts')
        return new Error('Too many retries')
      }
      return Math.min(retries * 50, 500)
    },
  },
})

redis.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redis.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

// Connect immediately
if (!redis.isOpen) {
  redis.connect().catch((err) => {
    console.error('Failed to connect to Redis:', err)
  })
}

export default redis

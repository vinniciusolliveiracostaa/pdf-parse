import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { schema } from './schema'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

export const db = drizzle({
  client: pool,
  schema,
  casing: 'snake_case',
  logger: process.env.NODE_ENV === 'development',
})

export async function closeDatabase() {
  await pool.end()
}

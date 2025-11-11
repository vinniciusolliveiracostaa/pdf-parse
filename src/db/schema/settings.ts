import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const settings = pgTable('settings', {
  id: text('id').primaryKey(),
  primaryColor: text('primary_color').default('#3b82f6').notNull(),
  logoUrl: text('logo_url'),
  systemName: text('system_name').default('Leilão Caixa').notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})

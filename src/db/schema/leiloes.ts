import { date, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const leilao = pgTable('leilao', {
  id: text('id').primaryKey(),
  dataLicitacao: date('data_licitacao', { mode: 'string' }).notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})

export const catalogo = pgTable('catalogo', {
  id: text('id').primaryKey(),
  leilaoId: text('leilao_id')
    .references(() => leilao.id, { onDelete: 'cascade' })
    .notNull(),
  lote: text('lote').notNull(),
  contrato: text('contrato').notNull(),
  descricao: text('descricao').notNull(),
  valor: text('valor').notNull(),
  anotacoes: text('anotacoes'),
  peso: text('peso'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})

export const relatorio = pgTable('relatorio', {
  id: text('id').primaryKey(),
  leilaoId: text('leilao_id')
    .references(() => leilao.id, { onDelete: 'cascade' })
    .notNull(),
  cpfCnpj: text('cpf_cnpj'),
  numeroLote: text('numero_lote').notNull(),
  valorLance: text('valor_lance').notNull(),
  tarifa: text('tarifa').notNull(),
  total: text('total').notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})

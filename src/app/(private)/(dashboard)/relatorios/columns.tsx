'use client'
import type { ColumnDef } from '@tanstack/react-table'

export type Relatorio = {
  id: string
  cpfCnpj: string | null
  numeroLote: string
  valorLance: string
  tarifa: string
  total: string
  dataLicitacao: string | null
}

export const columns: ColumnDef<Relatorio>[] = [
  {
    accessorKey: 'dataLicitacao',
    header: 'Data Licitação',
    cell: ({ row }) => {
      const data = row.getValue('dataLicitacao') as string | null
      if (!data) return 'N/A'
      // Adicionando um dia para corrigir o fuso horário
      const date = new Date(data)
      date.setDate(date.getDate() + 1)
      return date.toLocaleDateString('pt-BR')
    },
  },
  {
    accessorKey: 'cpfCnpj',
    header: 'CPF/CNPJ',
  },
  {
    accessorKey: 'numeroLote',
    header: 'Nº Lote',
  },
  {
    accessorKey: 'valorLance',
    header: 'Valor Lance',
    cell: ({ row }) => {
      const valor = row.getValue('valorLance') as string
      return valor.startsWith('R$') ? valor : `R$ ${valor}`
    },
  },
  {
    accessorKey: 'tarifa',
    header: 'Tarifa',
    cell: ({ row }) => {
      const valor = row.getValue('tarifa') as string
      return valor.startsWith('R$') ? valor : `R$ ${valor}`
    },
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => {
      const valor = row.getValue('total') as string
      return valor.startsWith('R$') ? valor : `R$ ${valor}`
    },
  },
]

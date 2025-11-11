'use client'

import type { ColumnDef } from '@tanstack/react-table'

export type Catalogo = {
  id: string
  lote: string
  contrato: string
  descricao: string
  valor: string
  peso: string | null
  anotacoes: string | null
  dataLicitacao: string | null
}

export const columns: ColumnDef<Catalogo>[] = [
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
    accessorKey: 'lote',
    header: 'Lote',
  },
  {
    accessorKey: 'contrato',
    header: 'Contrato',
  },
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    cell: ({ row }) => {
      const descricao = row.getValue('descricao') as string
      return (
        <div className="max-w-md truncate" title={descricao}>
          {descricao}
        </div>
      )
    },
  },
  {
    accessorKey: 'valor',
    header: 'Valor',
  },
  {
    accessorKey: 'anotacoes',
    header: 'Anotações',
    cell: ({ row }) => {
      const anotacoes = row.getValue('anotacoes') as string | null
      return (
        <div className="max-w-xs truncate" title={anotacoes || ''}>
          {anotacoes || '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'peso',
    header: 'Peso',
    cell: ({ row }) => {
      const peso = row.getValue('peso') as string | null
      return peso || '-'
    },
  },
]

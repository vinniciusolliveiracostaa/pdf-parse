'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deleteLeilao } from './actions'

interface DeleteLeilaoProps {
  leilaoId: string
  dataLicitacao: string
  isAdmin: boolean
}

export function DeleteLeilao({
  leilaoId,
  dataLicitacao,
  isAdmin,
}: DeleteLeilaoProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (!isAdmin) return null

  const handleDelete = async () => {
    setLoading(true)
    const result = await deleteLeilao(leilaoId)

    if (result.success) {
      toast.success('Leilão excluído com sucesso')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || 'Erro ao excluir leilão')
    }
    setLoading(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Leilão</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja excluir o leilão de{' '}
              <strong>
                {new Date(dataLicitacao).toLocaleDateString('pt-BR')}
              </strong>
              ?
            </p>
            <p className="text-destructive">
              ⚠️ Esta ação não pode ser desfeita. Todos os catálogos e relatórios
              relacionados serão excluídos permanentemente.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Excluindo...' : 'Excluir Permanentemente'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

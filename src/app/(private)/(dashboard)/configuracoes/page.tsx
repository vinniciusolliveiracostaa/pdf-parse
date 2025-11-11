'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { updateProfile } from './actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function ConfiguracoesPage() {
  const { data: session, isPending } = useSession()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name)
      setEmail(session.user.email)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result.success) {
      toast.success('Perfil atualizado com sucesso!')
    } else {
      toast.error(result.error || 'Erro ao atualizar perfil')
    }

    setLoading(false)
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua conta
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>
              Detalhes da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">ID do Usuário</p>
              <p className="text-sm text-muted-foreground font-mono">{session?.user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email Verificado</p>
              <p className="text-sm text-muted-foreground">
                {session?.user.emailVerified ? 'Sim' : 'Não'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { desc, eq } from 'drizzle-orm'
import { Upload } from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { account } from '@/db/schema/accounts'
import { leilao } from '@/db/schema/leiloes'
import { auth } from '@/lib/auth'
import { DeleteLeilao } from './delete-leilao'
import { UploadForm } from './upload-form'

export default async function UploadPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  // Verificar se é admin
  const [userAccount] = await db
    .select()
    .from(account)
    .where(eq(account.userId, session.user.id))
    .limit(1)

  const isAdmin = userAccount?.role === 'ADMIN'

  // Buscar últimos uploads
  const ultimosUploads = await db
    .select()
    .from(leilao)
    .orderBy(desc(leilao.createdAt))
    .limit(10)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 overflow-hidden p-4 pt-2">
      <div className="flex shrink-0 flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload de PDFs</h1>
        <p className="text-muted-foreground">
          Faça upload e processe catálogos e relatórios de leilões
        </p>
      </div>

      <div className="grid flex-1 gap-4 overflow-hidden @xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              <CardTitle>Novo Upload</CardTitle>
            </div>
            <CardDescription>
              Selecione os arquivos PDF para processar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm />
          </CardContent>
        </Card>

        <Card className="flex min-h-0 flex-col">
          <CardHeader className="shrink-0">
            <CardTitle>Últimos Uploads</CardTitle>
            <CardDescription>
              Histórico dos {ultimosUploads.length} uploads mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {ultimosUploads.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Nenhum upload realizado ainda
              </div>
            ) : (
              <div className="space-y-3">
                {ultimosUploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">
                        Leilão{' '}
                        {new Date(upload.dataLicitacao).toLocaleDateString(
                          'pt-BR',
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(upload.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>Processado</Badge>
                      <DeleteLeilao
                        leilaoId={upload.id}
                        dataLicitacao={upload.dataLicitacao}
                        isAdmin={isAdmin}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

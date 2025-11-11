import { account } from './accounts'
import { catalogo, leilao, relatorio } from './leiloes'
import { session } from './sessions'
import { settings } from './settings'
import { user } from './users'
import { verification } from './verifications'

export const schema = {
  account,
  session,
  user,
  verification,
  leilao,
  catalogo,
  relatorio,
  settings,
}

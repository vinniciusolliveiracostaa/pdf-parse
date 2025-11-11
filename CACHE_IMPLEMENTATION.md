# 🚀 Implementação de Cache com Redis

## ✅ O que foi implementado:

### 1. **Redis Client** (`src/lib/redis.ts`)
- Cliente Redis configurado e conectado
- Logs de conexão e erros
- URL configurável via `REDIS_URL`

### 2. **Better Auth + Redis** (`src/lib/auth.ts`)
- `secondaryStorage` configurado para usar Redis
- Sessions armazenadas em cache
- Cookie cache habilitado (5 minutos)
- TTL de 7 dias para sessions

### 3. **Cache Helpers** (`src/lib/cache.ts`)
- Funções helper para manipular cache
- `cachedFn()` para wrapping automático de funções
- `CacheKeys` com prefixos organizados

## 📚 Como Usar:

### Exemplo 1: Cache Simples
```typescript
import { cache, CacheKeys } from '@/lib/cache'

// Salvar no cache (TTL padrão: 5 minutos)
await cache.set('minha-chave', { data: 'valor' })

// Buscar do cache
const valor = await cache.get('minha-chave')

// Deletar do cache
await cache.del('minha-chave')
```

### Exemplo 2: Cache com TTL Customizado
```typescript
import { cache } from '@/lib/cache'

// Cache por 1 hora (3600 segundos)
await cache.set('stats', statsData, 3600)

// Cache por 1 dia (86400 segundos)
await cache.set('leiloes', leiloes, 86400)
```

### Exemplo 3: Usando cachedFn (Recomendado)
```typescript
import { cachedFn, CacheKeys } from '@/lib/cache'

export async function getStats() {
  return cachedFn(
    CacheKeys.STATS,
    async () => {
      // Esta query só roda se não estiver em cache
      return await db.select()...
    },
    600 // Cache por 10 minutos
  )
}
```

### Exemplo 4: Cache de Dashboard Stats
```typescript
// Em src/app/(private)/(dashboard)/page.tsx

import { cachedFn, CacheKeys } from '@/lib/cache'

// Antes (sem cache):
const leiloesCount = await db.select({ count: count() }).from(leilao)

// Depois (com cache de 5 minutos):
const leiloesCount = await cachedFn(
  'dashboard:leiloes-count',
  async () => await db.select({ count: count() }).from(leilao),
  300
)
```

### Exemplo 5: Invalidar Cache após Upload
```typescript
// Em src/app/(private)/(dashboard)/upload/actions.ts

import { cache, CacheKeys } from '@/lib/cache'

export async function uploadPdfs(formData: FormData) {
  // ... processar upload ...
  
  // Invalidar caches relacionados
  await cache.delPattern('leiloes:*')
  await cache.del(CacheKeys.STATS)
  await cache.del(CacheKeys.LEILOES_LIST)
  
  return { success: true }
}
```

## 🎯 Cache Keys Disponíveis:

```typescript
CacheKeys.SESSION(id)       // session:123
CacheKeys.USER(id)          // user:456
CacheKeys.LEILAO(id)        // leilao:789
CacheKeys.LEILOES_LIST      // leiloes:list
CacheKeys.CATALOGOS(id)     // catalogos:789
CacheKeys.RELATORIOS(id)    // relatorios:789
CacheKeys.STATS             // stats:dashboard
CacheKeys.SETTINGS          // settings:system
```

## ⚡ Benefícios:

1. **Better Auth Sessions em Cache**
   - Sessions verificadas em Redis primeiro
   - Reduz queries ao PostgreSQL
   - Resposta mais rápida

2. **Dashboard Performance**
   - Stats pesadas em cache
   - Gráficos carregam instantaneamente
   - Menos load no banco

3. **Escalabilidade**
   - Redis distribui cache entre instâncias
   - Pronto para load balancing
   - Pode rodar Redis Cluster

## 🔧 Variáveis de Ambiente:

```env
REDIS_URL=redis://localhost:6379
```

## 📊 Próximos Passos Recomendados:

1. **Adicionar cache na Dashboard**
   - Stats cards
   - Gráficos
   - Top 10 listas

2. **Adicionar cache em Catálogos/Relatórios**
   - Lista paginada
   - Busca de lotes
   - Filtros

3. **Monitoramento**
   - Adicionar métricas de hit rate
   - Log de cache misses
   - Dashboard de Redis

4. **Cache Warming**
   - Pre-popular cache após upload
   - Background job para atualizar stats
   - Scheduled cache refresh

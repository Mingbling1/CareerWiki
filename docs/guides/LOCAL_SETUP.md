# Guía: Setup Local

> Cómo levantar todo el entorno de desarrollo.
>
> **Última actualización:** 24 de febrero de 2026

---

## Arquitectura Local ↔ Producción

```
┌──────────────────────────────────────────────┐
│              LOCAL (Docker Compose)           │
│                                              │
│  PostgreSQL ─── :5432                        │
│     └── DB: empliq_pre_prod (staging)        │
│         ├── public schema (Prisma)           │
│         └── auth schema (GoTrue)             │
│                                              │
│  Website (Next.js) ─── :3000                 │
│     │                                        │
│     ├── OAuth:  Kong :8000 → GoTrue :9999    │
│     │              → auth.users (Postgres)   │
│     │                                        │
│     └── API:    localhost:4000 ──────────────┼──── empliq_pre_prod
│                                              │
│  Studio ─── :54323 (dashboard Supabase)      │
│  Scraper ─── :3457                           │
│  API local ─── :4000                         │
└──────────────────────────────────────────────┘
```

**Resumen:** Todo en local consume `empliq_pre_prod`:
- El **backend local** (:4000) conecta a `empliq_pre_prod` via Prisma
- **GoTrue local** conecta a `empliq_pre_prod` (schema `auth`)
- **Supabase Auth solo es para desarrollo** — los usuarios de OAuth local NO afectan producción
- En producción, todo consume `empliq_prod` con su propio GoTrue (`supabase.musuq.me`)

Ver `docs/technical/DATABASE_SAFETY.md` para reglas críticas de seguridad.

---

## Prerrequisitos

- Docker + Docker Compose
- Node.js 22+
- Git

## 1. Clonar y configurar

```bash
git clone https://github.com/Mingbling1/CareerWiki.git sueldos-organigrama
cd sueldos-organigrama
```

## 2. Variables de entorno

### `docker/.env` (ya incluido en el repo)

```env
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_API_URL=http://localhost:4000/api   # API local consumiendo empliq_pre_prod
```

> Para usar la API de **producción** en vez de local:
> `NEXT_PUBLIC_API_URL=https://api.musuq.me/api`

### `apps/api/.env`

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://empliq:empliq_dev_password@localhost:5432/empliq_pre_prod
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ORACLE_PAR_UPLOAD_URL=https://objectstorage.sa-saopaulo-1.oraclecloud.com/p/.../o/
ORACLE_PUBLIC_URL_BASE=https://objectstorage.sa-saopaulo-1.oraclecloud.com/n/.../o/
```

### `apps/website/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://api.musuq.me/api
```

### `apps/empliq-scraper-api/.env`

```env
PORT=3457
API_KEY=dev-api-key
DATOSPERU_DIRECT=true
DATABASE_URL=postgresql://empliq:empliq_dev_password@localhost:5432/empliq_dev
```

## 3. Levantar con Docker

```bash
cd docker
docker compose -f docker-compose.dev.yml up -d
```

Esto levanta **8 contenedores**:

| Servicio | Puerto | URL | Propósito |
|----------|--------|-----|-----------|
| PostgreSQL | 5432 | `localhost:5432` | Base de datos local |
| GoTrue (Auth) | 9999 (int) | via Kong :8000 | OAuth / sesiones |
| Kong (Gateway) | 8000 | `localhost:8000` | Proxy `/auth/v1/*` → GoTrue |
| Postgres Meta | 8080 (int) | — | API REST para Studio |
| Studio | 54323 | `localhost:54323` | Dashboard Supabase |
| API (NestJS) | 4000 | `localhost:4000/api` | Backend local (opcional) |
| Website (Next.js) | 3000 | `localhost:3000` | Landing + app |
| Scraper API | 3457 | `localhost:3457/docs` | Enriquecimiento DatosPeru |

## 4. Verificar

```bash
# Todos los contenedores corriendo
docker compose -f docker-compose.dev.yml ps

# Auth health (GoTrue via Kong)
curl http://localhost:8000/auth/v1/health

# Website
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# API local
curl http://localhost:4000/api/companies
```

## 5. Storage — Oracle Object Storage

**No usamos Supabase Storage.** Los archivos (logos, imágenes) se suben
directamente a Oracle Object Storage usando PAR (Pre-Authenticated Request).

 **El tab "Storage" en Supabase Studio mostrará "Failed to retrieve buckets" — es
esperado.** No hay servicio `supabase/storage-api` porque no lo necesitamos.

El upload se maneja en:
- `apps/api/src/infrastructure/storage/storage.service.ts`
- `apps/empliq-scraper-api/src/infrastructure/adapters/oracle-storage.adapter.ts`

Ambos usan `fetch()` con PUT al PAR URL de Oracle.

## 6. Desarrollo sin Docker (alternativa)

```bash
# Terminal 1: API
cd apps/api && npm install && npm run start:dev

# Terminal 2: Website
cd apps/website && npm install && npm run dev
```

Requiere PostgreSQL local y Supabase Auth (Kong + GoTrue) corriendo.

## 7. Prisma

```bash
cd apps/api

# Generar cliente
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_descriptivo

# Ver DB en browser
npx prisma studio
```

## Hot Reload

- Docker volumes montan el código fuente directamente
- Cambios en `.tsx`, `.ts` se reflejan automáticamente
- Si cambias `package.json` o Prisma schema, rebuild: `docker compose up -d --build`

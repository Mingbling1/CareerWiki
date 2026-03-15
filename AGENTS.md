# Empliq

Plataforma tipo red social laboral peruana donde las empresas son el actor principal. Los usuarios exploran perfiles de empresas, organigramas interactivos, salarios y dejan contribuciones anonimas.

## Monorepo

```
apps/
  api/                    -- Backend NestJS (hexagonal, Prisma, :4000) -> api.empliq.io
  website/                -- Next.js landing + app (:3000) -> empliq.io (CF Workers)
  empliq-scraper-api/     -- Scraper NestJS (DatosPeru, :3457) -> scraper.empliq.io
docs/                     -- Documentacion completa del proyecto
scripts/                  -- Python (migracion, analisis)
data/                     -- CSVs empresas por tier
docker/                   -- Docker Compose, Dockerfiles, init-db.sql
```

## Stack

- **Frontend:** Next.js 16 + TailwindCSS 4 + shadcn/ui + ReactFlow + Framer Motion + Three.js
- **Backend:** NestJS 11 (arquitectura hexagonal) + Prisma 6 + PostgreSQL 16
- **Auth:** Supabase GoTrue self-hosted (Google OAuth) via Kong gateway. JWT en cookies httpOnly.
- **Storage:** Oracle Object Storage (PAR upload). NO Supabase Storage.
- **Scraper:** NestJS microservice, HTTP puro (Cheerio), DatosPeru enrichment, SOCKS5 proxy rotation
- **Infra:** Oracle Cloud ARM (A1.Flex 4c/24GB) + Docker + Traefik v3 (HTTPS via Cloudflare DNS)
- **CI/CD:** GitHub Actions

## Bases de datos (3 separadas)

| BD | Host | Proposito |
|---|---|---|
| `empliq_dev` | Oracle Cloud | Raw data scrapers (JSONB `companies_raw`). Se puede resetear. |
| `empliq_pre_prod` | Local Docker | Staging con Prisma schema + GoTrue local. Se puede resetear. |
| `empliq_prod` | Oracle Cloud | Produccion real. NUNCA modificar directamente. Solo `prisma migrate deploy`. |

Flujo: `empliq_dev -> empliq_pre_prod -> empliq_prod`. Nunca al reves.

## Reglas criticas

1. **Prisma es la fuente de verdad del schema** (`apps/api/prisma/schema.prisma`)
2. `prisma db push` solo contra `empliq_pre_prod`. NUNCA contra `empliq_prod`.
3. Schema `auth` lo gestiona GoTrue (52 migraciones internas). Schema `public` lo gestiona Prisma. Son independientes.
4. La tabla `profiles` vincula `auth.users.id` con datos de la app. Nunca borrar.
5. NO usar Supabase Storage. Los archivos van a Oracle Object Storage.
6. El website local consume la API de produccion por defecto (`api.empliq.io`).
7. Diseno monocromatico: negro, blanco, plata. Color solo para impacto (green para stats).

## Repos

| Repo | Contenido | Deploy |
|------|-----------|--------|
| `CareerWiki` (monorepo) | `apps/{api, website, empliq-scraper-api}`, docs, scripts | -- |
| `empliq-backend` | Backend API standalone | `api.empliq.io` |
| `empliq-website` | Website standalone | `empliq.io` (CF Workers) |
| `musuq-platform` | Scripts infra Oracle Cloud, CI/CD, Docker services | Oracle ARM |

Cuando se modifica `apps/api/`, sincronizar cambios a `empliq-backend` y hacer push.

## Dominios

| Dominio | Servicio |
|---------|----------|
| `empliq.io` | Website (CF Workers) |
| `api.empliq.io` | Backend NestJS (Oracle + Traefik) |
| `auth.empliq.io` | Supabase GoTrue via Kong (Oracle + Traefik) |
| `studio.empliq.io` | Supabase Studio |
| `scraper.empliq.io` | Scraper API |

## Documentacion detallada

Para informacion profunda sobre cada modulo, usa los **skills** disponibles (`empliq-api`, `empliq-frontend`, `empliq-website`, `empliq-scraper`, `empliq-database`, `empliq-auth`, `empliq-deploy`, `empliq-design`). Carga el skill relevante segun la tarea.

La documentacion completa esta en `docs/`. Ver `docs/INDICE.md` para el mapa.

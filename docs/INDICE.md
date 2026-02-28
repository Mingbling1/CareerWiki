# Empliq -- Indice de Documentacion

> Mapa completo de la documentacion del proyecto. Usar como punto de entrada.
>
> **Ultima actualizacion:** 27 de febrero de 2026

---

## Estado del Proyecto

| Documento | Descripcion |
|-----------|-------------|
| [TODO.md](./TODO.md) | Source of truth. Estado actual, prioridades P0/P1/P2, definicion de done |
| [README.md](./README.md) | Descripcion general del proyecto y navegacion rapida |

---

## Arquitectura

| Documento | Descripcion |
|-----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Diagramas Mermaid: contenedores Docker, hexagonal, flujo de datos, modelo ER, stack |
| [DATA_MIGRATION.md](./DATA_MIGRATION.md) | Arquitectura de 3 bases de datos, script de migracion, mapeo de campos |

---

## Producto

| Documento | Descripcion |
|-----------|-------------|
| [product/BRIEF.md](./product/BRIEF.md) | Brief del producto, tabs principales, analisis de competencia |
| [product/MVP.md](./product/MVP.md) | Funcionalidades MVP, modelo de datos, flujos de usuario |
| [BRIEF_LANDING.md](./BRIEF_LANDING.md) | Brief especifico de la landing page |

---

## Tecnico

| Documento | Descripcion |
|-----------|-------------|
| [technical/AUTH.md](./technical/AUTH.md) | Supabase GoTrue self-hosted, Google OAuth, JWT, implementacion Next.js + NestJS |
| [technical/DATABASE_SAFETY.md](./technical/DATABASE_SAFETY.md) | Reglas criticas de seguridad para bases de datos, Prisma practices |
| [technical/DATA_PIPELINE.md](./technical/DATA_PIPELINE.md) | Pipeline de datos, scraping DatosPeru, segmentacion de empresas |
| [technical/DESIGN_SYSTEM.md](./technical/DESIGN_SYSTEM.md) | Tokens de diseno, tipografia, colores, componentes, patrones UI/UX |

---

## Aplicaciones

| Documento | Descripcion |
|-----------|-------------|
| [apps/api.md](./apps/api.md) | API NestJS: entidades, use cases, endpoints, variables de entorno |
| [apps/website.md](./apps/website.md) | Website Next.js: composicion, identidad visual, assets |
| [apps/frontend.md](./apps/frontend.md) | Frontend React: paginas, componentes, organigrama |
| [apps/scraper.md](./apps/scraper.md) | Scraper API: estrategias DatosPeru, endpoints, proxy rotation |

---

## Guias (Runbooks)

| Documento | Descripcion |
|-----------|-------------|
| [guides/LOCAL_SETUP.md](./guides/LOCAL_SETUP.md) | Setup local con Docker, 8 contenedores, variables de entorno |
| [guides/DEPLOY.md](./guides/DEPLOY.md) | Deploy a Oracle Cloud ARM con Traefik |
| [guides/TROUBLESHOOTING.md](./guides/TROUBLESHOOTING.md) | Problemas comunes y soluciones |

---

## Decisiones Arquitectonicas (ADR)

| ADR | Decision |
|-----|----------|
| [001](./decisions/001-hexagonal-architecture.md) | Arquitectura hexagonal para API y Scraper |
| [002](./decisions/002-better-auth.md) | Supabase Self-Hosted (GoTrue) para Auth |
| [003](./decisions/003-dual-database-jsonb.md) | Dual DB: JSONB para scraper, Prisma para app |
| [004](./decisions/004-datosperu-only-pipeline.md) | Pipeline solo DatosPeru (sin busqueda web) |
| [005](./decisions/005-monochromatic-design.md) | Diseno monocromatico para website |
| [006](./decisions/006-oracle-cloud-arm.md) | Oracle Cloud ARM para produccion |

---

## Referencia

| Recurso | Descripcion |
|---------|-------------|
| [database/schema.sql](./database/schema.sql) | Schema SQL de inicializacion |
| [database/staging_table.sql](./database/staging_table.sql) | Tabla staging para scraper |
| [database/proxies_table.sql](./database/proxies_table.sql) | Tabla de proxies |
| [n8n-workflows/](./n8n-workflows/) | Workflows de n8n exportados (JSON) |

---

## Estructura del Monorepo

```
sueldos-organigrama/
  apps/
    api/              -- Backend NestJS (hexagonal, Prisma, puerto 4000)
    website/          -- Website Next.js (landing + app, puerto 3000)
    empliq-scraper-api/ -- Scraper NestJS (DatosPeru, puerto 3457)
  docs/               -- Esta carpeta (documentacion completa)
  scripts/            -- Scripts Python (migracion, analisis, procesamiento)
  data/               -- CSVs de empresas por tier
  docker/             -- Docker Compose, Dockerfiles, init-db.sql
```

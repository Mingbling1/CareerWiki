---
name: empliq-deploy
description: Docker Compose local setup, Oracle Cloud ARM production deployment, Traefik HTTPS, Cloudflare Workers, CI/CD, and troubleshooting
---

# Empliq Deploy & Infrastructure

## Infraestructura

| Componente | Plataforma | CI/CD |
|------------|-----------|-------|
| Website (Next.js) | Cloudflare Workers | GitHub Actions -> `empliq-website` repo |
| API (NestJS) | Oracle Cloud ARM (Docker + Traefik) | GitHub Actions -> `musuq-platform` repo |
| Scraper | Oracle Cloud ARM (Docker + Traefik) | GitHub Actions -> `musuq-platform` repo |
| Supabase (Auth/Kong/Studio) | Oracle Cloud ARM (Docker + Traefik) | GitHub Actions -> `musuq-platform` repo |

- **Servidor Oracle:** A1.Flex ARM — 4 cores, 24GB RAM (163.176.250.185)
- **Reverse Proxy:** Traefik v3 con Let's Encrypt (Cloudflare DNS Challenge)

## Setup local (Docker)

```bash
cd docker
docker compose -f docker-compose.dev.yml up -d
```

8 contenedores:

| Servicio | Puerto | Proposito |
|----------|--------|-----------|
| PostgreSQL | 5432 | BD local (empliq_pre_prod) |
| GoTrue (Auth) | 9999 (int) | OAuth / sesiones via Kong |
| Kong (Gateway) | 8000 | Proxy /auth/v1/* -> GoTrue |
| Postgres Meta | 8080 (int) | API REST para Studio |
| Studio | 54323 | Dashboard Supabase |
| API (NestJS) | 4000 | Backend local (opcional) |
| Website (Next.js) | 3000 | Landing + app |
| Scraper API | 3457 | DatosPeru enrichment |

Prerrequisitos: Docker + Docker Compose, Node.js 22+, Git.

## Variables de entorno

### docker/.env
```env
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### apps/api/.env, apps/website/.env.local, apps/empliq-scraper-api/.env
Ver docs/guides/LOCAL_SETUP.md para valores completos.

## Desarrollo sin Docker

```bash
# Terminal 1: API
cd apps/api && npm install && npm run start:dev
# Terminal 2: Website
cd apps/website && npm install && npm run dev
```

Requiere PostgreSQL local y Supabase Auth (Kong + GoTrue) corriendo.

## Deploy a produccion

### Website (Cloudflare Workers)
- Repo: `empliq-website`
- Secrets: `CF_WORKERS_API_TOKEN`, `CF_WORKERS_ACCOUNT_ID`
- Manual: `cd apps/website && npm run deploy`

### Backend (Oracle Cloud ARM)
- Repo: `musuq-platform`
- Secrets: `SSH_PRIVATE_KEY`, `INSTANCE_IP`, `CLOUDFLARE_API_TOKEN`, `SCRAPER_API_KEY`, etc.
- Manual: `ssh ubuntu@163.176.250.185 && sudo bash /opt/scripts/deploy-https.sh`

## Tokens de Cloudflare (2 distintos, NO mezclar)

| Token | Proposito | Donde se usa |
|-------|-----------|--------------|
| Traefik DNS | ACME DNS Challenge para certs SSL | `CLOUDFLARE_API_TOKEN` en `musuq-platform` |
| Workers Deploy | Deploy website a CF Workers | `CF_WORKERS_API_TOKEN` en `empliq-website` |

## Dominios

| Dominio | Servicio | Plataforma |
|---------|----------|-----------|
| `empliq.io` | Website | Cloudflare Workers |
| `api.empliq.io` | Backend NestJS | Oracle + Traefik |
| `auth.empliq.io` | Supabase GoTrue | Oracle + Traefik |
| `studio.empliq.io` | Supabase Studio | Oracle + Traefik |
| `scraper.empliq.io` | Scraper API | Oracle + Traefik |

## Convencion de contenedores

- `empliq-` prefix: servicios publicos (empliq.io)
- `musuq-` prefix: herramientas internas (musuq.me)
- Sin prefijo: infraestructura base (traefik)

## Hot Reload

Docker volumes montan el codigo fuente. Cambios en .tsx/.ts se reflejan automaticamente.
Si cambias package.json o Prisma schema: `docker compose up -d --build`

## Storage

NO hay Supabase Storage. El tab "Storage" en Studio mostrara error — es esperado.
Archivos van a Oracle Object Storage via PAR upload.

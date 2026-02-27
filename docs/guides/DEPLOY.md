# Guía: Deploy a Producción

> Arquitectura híbrida: Website en Cloudflare Workers, Backend en Oracle Cloud ARM.

## Infraestructura

| Componente | Plataforma | CI/CD |
|------------|-----------|-------|
| **Website (Next.js)** | Cloudflare Workers | GitHub Actions → `empliq-website` repo |
| **API (NestJS)** | Oracle Cloud ARM (Docker + Traefik) | GitHub Actions → `musuq-platform` repo |
| **Scraper** | Oracle Cloud ARM (Docker + Traefik) | GitHub Actions → `musuq-platform` repo |
| **Supabase (Auth/Kong/Studio)** | Oracle Cloud ARM (Docker + Traefik) | GitHub Actions → `musuq-platform` repo |

- **Servidor Oracle:** A1.Flex ARM — 4 cores, 24GB RAM (163.176.250.185)
- **Reverse Proxy:** Traefik v3 con Let's Encrypt (Cloudflare DNS Challenge)
- **Edge:** Cloudflare Workers (300+ PoPs)

## Dominios

| Dominio | Servicio | Plataforma |
|---------|----------|-----------|
| `empliq.io` | Website (Next.js) | Cloudflare Workers |
| `www.empliq.io` | Redirect → empliq.io | Cloudflare Workers |
| `api.empliq.io` | API (NestJS) | Oracle + Traefik |
| `auth.empliq.io` → `supabase.musuq.me` | Supabase GoTrue | Oracle + Traefik |
| `scraper.musuq.me` | Scraper API | Oracle + Traefik |

## Website — Cloudflare Workers

El website se despliega en Cloudflare Workers vía OpenNext.

- **Repo:** `github.com/Mingbling1/empliq-website`
- **Workflow:** `.github/workflows/deploy.yml`
- **Worker URL:** `empliq-website.jimmy-auris.workers.dev`
- **Custom domain:** `empliq.io` (configurar en CF Dashboard)

### Secrets en GitHub (repo empliq-website)

| Secret | Valor |
|--------|-------|
| `CF_WORKERS_API_TOKEN` | Token con permisos Workers:Edit |
| `CF_WORKERS_ACCOUNT_ID` | `70d3ebd86fd199ed070cc93d3296abca` |

> **IMPORTANTE:** Nombres distintos a los de musuq-platform para evitar confusión.

### Deploy manual

```bash
cd apps/website
npm run deploy
# Requiere CLOUDFLARE_API_TOKEN en env (wrangler lo lee así)
```

Ver [CLOUDFLARE_DEPLOY.md](../technical/CLOUDFLARE_DEPLOY.md) para detalle completo.

## Backend — Oracle Cloud ARM

El backend, scraper, y stack Supabase se despliegan en Oracle vía Docker.

- **Repo:** `github.com/Mingbling1/musuq-platform`
- **Workflow:** `.github/workflows/deploy-https.yml`

### Secrets en GitHub (repo musuq-platform)

```
SSH_PRIVATE_KEY              # Llave SSH al servidor Oracle
INSTANCE_IP                  # 163.176.250.185
CLOUDFLARE_API_TOKEN         # Para Traefik DNS Challenge
SCRAPER_API_KEY              # API key para el scraper
EMPLIQ_GOOGLE_CLIENT_ID      # OAuth
EMPLIQ_GOOGLE_CLIENT_SECRET   # OAuth
```

### Deploy manual

```bash
ssh ubuntu@163.176.250.185
sudo bash /opt/scripts/deploy-https.sh
```

## Troubleshooting

Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

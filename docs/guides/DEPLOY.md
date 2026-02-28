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
| `auth.empliq.io` | Supabase GoTrue (Auth) | Oracle + Traefik |
| `studio.empliq.io` | Supabase Studio | Oracle + Traefik |
| `scraper.empliq.io` | Scraper API | Oracle + Traefik |

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

## Tokens de Cloudflare — Mapa completo

Hay **dos tokens** distintos con propósitos distintos. NO mezclar.

| Token | Propósito | Permisos | Dónde se usa |
|-------|-----------|----------|--------------|
| **Traefik DNS** | ACME DNS Challenge para certs SSL | Zone:DNS:Edit (musuq.me + empliq.io) | Secret `CLOUDFLARE_API_TOKEN` en repo **musuq-platform** → llega al server como `CF_DNS_API_TOKEN` |
| **Workers Deploy** | Deploy website a CF Workers | Account:Workers Scripts:Edit | Secret `CF_WORKERS_API_TOKEN` en repo **empliq-website** → wrangler lo lee como `CLOUDFLARE_API_TOKEN` |

> **IMPORTANTE:**
> - `CF_WORKERS_API_TOKEN` y `CF_WORKERS_ACCOUNT_ID` van en el repo **empliq-website**, NO en musuq-platform.
> - `CLOUDFLARE_API_TOKEN` en musuq-platform es para Traefik DNS Challenge (Let's Encrypt certs para *.empliq.io, *.musuq.me).
> - Si se actualiza el token de Traefik en CF Dashboard, el valor NO cambia (solo se expanden permisos de zona).

## Troubleshooting

Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

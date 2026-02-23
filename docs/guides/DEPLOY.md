# Guía: Deploy a Producción

> Deploy a Oracle Cloud ARM con Docker y Traefik.

## Infraestructura

- **Servidor:** Oracle Cloud ARM (A1.Flex) — 4 cores, 24GB RAM
- **Reverse Proxy:** Traefik v3 con Let's Encrypt (HTTPS automático)
- **CI/CD:** GitHub Actions → SSH → docker compose pull + up

## Dominio

| Subdominio | Servicio |
|------------|----------|
| `empliq.com` | Website (Next.js) |
| `app.empliq.com` | Frontend (React) |
| `api.empliq.com` | API (NestJS) |
| `scraper.musuq.me` | Scraper API (standalone) |

## Deploy Manual

```bash
# SSH al servidor
ssh opc@<oracle-ip>

# Pull latest
cd /opt/empliq
git pull

# Rebuild y restart
docker compose -f docker-compose.prod.yml up -d --build

# Verificar
docker compose ps
docker logs empliq-api --tail 20
```

## Deploy con GitHub Actions

El repositorio tiene un workflow CI/CD que:
1. Build de imágenes Docker (multi-arch ARM64)
2. Push a container registry
3. SSH al servidor
4. `docker compose pull` + `docker compose up -d`

### Secrets requeridos en GitHub

```
ORACLE_SSH_KEY        # Llave SSH privada
ORACLE_HOST           # IP del servidor
ORACLE_USER           # opc
SCRAPER_API_KEY       # API key para el scraper
```

## Scraper (Deploy Standalone)

El scraper tiene su propio CI/CD:

```bash
cd apps/empliq-scraper-api
./deploy.sh
```

Incluye labels de Traefik para `scraper.musuq.me`.

## Troubleshooting

Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

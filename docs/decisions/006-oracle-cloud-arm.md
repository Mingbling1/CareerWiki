# ADR-006: Oracle Cloud ARM para Producción

**Fecha:** Enero 2026
**Estado:** Aceptado

## Contexto

Necesitamos hosting para producción. El proyecto es un MVP con presupuesto limitado.

## Opciones Evaluadas

1. **Vercel/Railway** — Fácil pero costoso al escalar, vendor lock-in
2. **Oracle Cloud ARM (Free Tier)** — 4 ARM cores, 24GB RAM, 200GB storage gratis
3. **Hetzner** — Barato (€4/mes) pero sin free tier

## Decisión

Oracle Cloud ARM con Free Tier (Ampere A1.Flex). Deploy con Docker + Traefik para HTTPS automático.

**Setup:**
- 4 cores ARM64, 24GB RAM (Always Free)
- Docker Compose con todos los servicios
- Traefik para reverse proxy + Let's Encrypt
- GitHub Actions para CI/CD automático

## Consecuencias

- **Positivo:** Gratis (literalmente $0/mes)
- **Positivo:** Recursos generosos (24GB RAM es más que suficiente)
- **Positivo:** Full control del servidor
- **Negativo:** ARM64 requiere builds multi-arch (Docker buildx)
- **Negativo:** Oracle Cloud UX es confusa comparada con AWS/GCP
- **Negativo:** Free Tier puede ser revocado sin previo aviso

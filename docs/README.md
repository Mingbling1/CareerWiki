# Empliq — Documentación

> Plataforma de transparencia laboral centrada en empresas. Red social donde profesionales comparten anónimamente salarios, organigramas y experiencias laborales.

---

## Navegación

### Estado del Proyecto
- **[TODO.md](./TODO.md)** — Source of truth. Estado actual, prioridades P0/P1/P2, definición de done.

### Arquitectura
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Diagramas Mermaid: contenedores Docker, arquitectura hexagonal, flujo de datos, modelo ER, stack tecnológico.

### Producto
- [product/BRIEF.md](./product/BRIEF.md) — Brief de la landing page y definición del producto MVP
- [product/MVP.md](./product/MVP.md) — Funcionalidades del MVP, modelo de datos, flujos de usuario

### Técnico
- [technical/AUTH.md](./technical/AUTH.md) — Implementación de Better Auth (NestJS + React)
- [technical/DATA_PIPELINE.md](./technical/DATA_PIPELINE.md) — Pipeline de datos, scraping, segmentación de empresas
- [technical/DESIGN_SYSTEM.md](./technical/DESIGN_SYSTEM.md) — Tokens de diseño, componentes, tipografía, colores

### Decisiones (ADR)
- [decisions/001 — Arquitectura Hexagonal](./decisions/001-hexagonal-architecture.md)
- [decisions/002 — Better Auth](./decisions/002-better-auth.md)
- [decisions/003 — Dual Database JSONB](./decisions/003-dual-database-jsonb.md)
- [decisions/004 — Pipeline DatosPeru](./decisions/004-datosperu-only-pipeline.md)
- [decisions/005 — Diseño Monocromático](./decisions/005-monochromatic-design.md)
- [decisions/006 — Oracle Cloud ARM](./decisions/006-oracle-cloud-arm.md)

### Apps (Componentes)
- [apps/api.md](./apps/api.md) — API: entidades, use cases, endpoints, variables
- [apps/frontend.md](./apps/frontend.md) — Frontend: páginas, componentes, organigrama
- [apps/website.md](./apps/website.md) — Website: composición, identidad visual, assets
- [apps/scraper.md](./apps/scraper.md) — Scraper: estrategias, DatosPeru, endpoints

### Guías (Runbooks)
- [guides/LOCAL_SETUP.md](./guides/LOCAL_SETUP.md) — Setup local con Docker
- [guides/DEPLOY.md](./guides/DEPLOY.md) — Deploy a Oracle Cloud ARM
- [guides/TROUBLESHOOTING.md](./guides/TROUBLESHOOTING.md) — Problemas comunes y soluciones

### Referencia
- [database/schema.sql](./database/schema.sql) — Schema SQL de init
- [database/staging_table.sql](./database/staging_table.sql) — Tabla staging
- [database/proxies_table.sql](./database/proxies_table.sql) — Tabla de proxies
- [n8n-workflows/](./n8n-workflows/) — Workflows de n8n (JSON)

---

## Quick Start

```bash
cd docker
docker compose -f docker-compose.dev.yml up -d
```

| Servicio | URL |
|----------|-----|
| Website | http://localhost:3000 |
| Frontend | http://localhost:5173 |
| API | http://localhost:4000 |
| Scraper | http://localhost:3457/docs |
| PostgreSQL | localhost:5432 |

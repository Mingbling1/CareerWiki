# Empliq — Source of Truth

> Estado real del proyecto. Esto es lo primero que lee la IA/dev para entender contexto.
>
> **Última actualización:** 24 de febrero de 2026

---

## Prioridades

| Nivel | Significado |
|-------|-------------|
| **P0** | Bloqueante — resolver antes de cualquier otra cosa |
| **P1** | Esta semana — trabajo activo |
| **P2** | Backlog — próximas iteraciones |

---

## Estado por Módulo

| Módulo | Estado | Progreso |
|--------|--------|----------|
|  Empresas (API + Frontend) |  Completado | 100% |
|  Organigrama (API + Frontend) |  Completado | 100% |
|  Auth (Supabase GoTrue + Google OAuth) |  Completado | 100% |
|  Website Landing |  Completado | 100% |
|  Storage (Oracle Object Storage) |  Completado | 100% |
|  Scraper Microservice |  Completado | 100% |
|  DatosPeru Enrichment |  Producción | 100% |
|  Backend Producción (`api.empliq.io`) |  Desplegado | 100% |
|  Salarios |  Parcial | 40% |
|  Comentarios |  Parcial | 40% |
|  Puestos (vista detalle) |  Pendiente | 10% |
|  Entrevistas |  Pendiente | 10% |

---

## P0 — Bloqueante

- [ ] **Seed de datos de prueba** — Sin datos no se puede testear ningún flujo del MVP
  - Crear 5-10 empresas con datos reales (extraer de `companies_raw`)
  - Crear puestos, departamentos, organigramas de ejemplo
  - Crear salarios mock (para mostrar media/rango)
  - Crear comentarios mock

---

## P1 — Esta Semana

- [ ] **Vista detalle de puesto** (Frontend)
  - Página `/empresa/:slug/puesto/:id`
  - Mostrar: descripción, salarios (media), comentarios, info de entrevistas
  - Navegación desde organigrama (click en nodo → puesto)

- [ ] **Formulario de salario** (Frontend)
  - Modal para reportar salario anónimamente
  - Campos: monto, moneda, período, años de experiencia
  - Validación con class-validator en backend

- [ ] **Formulario de comentario** (Frontend)
  - Modal para agregar comentario anónimo
  - Campos: contenido, rating, pros, cons
  - Rate limiting en backend

- [ ] **Conectar Organigrama con Puestos**
  - Click en nodo del organigrama → navegar al puesto
  - Mostrar info resumida en tooltip del nodo

---

## P2 — Backlog

- [ ] Cálculo de media/mediana/rango de salarios (backend)
- [ ] Histograma de distribución de salarios (frontend)
- [ ] Módulo de entrevistas (CRUD completo)
- [ ] Módulo de documentos / recursos por puesto
- [ ] Middleware de protección de rutas (backend)
- [ ] Roles admin/user (backend)
- [ ] SEO meta tags (website)
- [ ] Analytics (website)
- [ ] Moderación de contenido
- [ ] Página de perfil de usuario
- [ ] docker-compose.prod.yml
- [ ] Pipeline Tier 4+5 (16,816 empresas pendientes)

---

## Completado Recientemente

- [x] ~~Backend desplegado en `api.empliq.io`~~ (24 feb 2026)
- [x] ~~Supabase GoTrue local para OAuth development~~ (24 feb 2026)
- [x] ~~Fix Buffer/BodyInit en storage (API + Scraper)~~ (24 feb 2026)
- [x] ~~Migración de Better Auth → Supabase GoTrue~~ (23 feb 2026)
- [x] ~~Monochromatic redesign del website~~ (21 feb 2026)
- [x] ~~IllustrationShowcase bento grid~~ (21 feb 2026)
- [x] ~~Hero + LogoCloud above the fold~~ (21 feb 2026)
- [x] ~~Documentación reorganizada~~ (21 feb 2026)
- [x] ~~DatosPeru Enrichment en producción~~ (Tier 1-3: 6,123 empresas)
- [x] ~~Website landing completo (header, hero, features, usecases, footer)~~
- [x] ~~CRUD de empresas (crear, actualizar, upload logo)~~
- [x] ~~Docker dev environment con hot reload~~
- [x] ~~Oracle Object Storage integration~~

---

## Definición de "Done" para MVP

- [ ] Usuario puede explorar empresas
- [ ] Usuario puede ver organigrama de una empresa
- [ ] Usuario puede ver puestos de una empresa
- [ ] Usuario puede ver salarios de un puesto (media + rango)
- [ ] Usuario puede ver comentarios de un puesto
- [ ] Usuario autenticado puede reportar salario (anónimo)
- [ ] Usuario autenticado puede agregar comentario (anónimo)
- [ ] Landing page funcional con redirección a la app
- [ ] Seed de datos reales (al menos 5 empresas completas)

---

## Contexto Técnico Rápido

- **Monorepo:** `apps/{api, website, empliq-scraper-api}`
- **Stack:** Next.js / NestJS (hexagonal) / PostgreSQL+Prisma
- **Docker local:** 8 containers — postgres:5432, gotrue:9999, kong:8000, meta:8080, studio:54323, api:4000, website:3000, scraper:3457
- **Auth:** Supabase GoTrue self-hosted (Google OAuth) — sesiones con JWT
- **Storage:** Oracle Object Storage (PAR upload) — **no** Supabase Storage
- **Deploy:** Oracle Cloud ARM + Docker + Traefik
- **Backend prod:** `https://api.empliq.io/api` (repo: empliq-backend)
- **Datos:** 6,123 empresas enriquecidas (Tier 1-3) en `companies_raw` (JSONB)
- **Diseño:** Monocromático (negro/blanco/plata) — color solo para impacto
- **Dev:** Website local consume API de producción. OAuth corre local.

> Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para diagramas detallados.
> Ver [decisions/](./decisions/) para decisiones técnicas documentadas.
> Ver [guides/LOCAL_SETUP.md](./guides/LOCAL_SETUP.md) para levantar el entorno.

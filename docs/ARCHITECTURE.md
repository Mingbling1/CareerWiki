# Empliq — Arquitectura del Sistema

> Diagramas y descripción de la arquitectura. Documenta el **por qué**, no el **qué**.

---

## Diagrama de Contenedores (Docker)

### Entorno Local (dev)

```mermaid
graph TB
    subgraph "Docker Compose (dev) — 8 containers"
        PG[(PostgreSQL 16<br/>:5432)]
        API[NestJS API<br/>:4000<br/><i>opcional</i>]
        WEB[Next.js Website<br/>:3000]
        SCR[Scraper API<br/>:3457]
        KONG[Kong Gateway<br/>:8000]
        AUTH[GoTrue Auth<br/>:9999]
        META[Postgres Meta<br/>:8080]
        STUDIO[Studio<br/>:54323]
    end

    USER((Usuario)) --> WEB
    WEB -->|API calls| PROD_API
    WEB -->|OAuth| KONG
    KONG --> AUTH
    AUTH --> PG
    API --> PG
    SCR --> PG
    META --> PG
    STUDIO --> META
    STUDIO --> KONG

    subgraph "Producción (Oracle Cloud ARM)"
        PROD_API[Backend API<br/>api.empliq.io]
        PROD_PG[(PostgreSQL<br/>empliq_prod)]
    end

    PROD_API --> PROD_PG

    subgraph "Externo"
        OCI[Oracle Object Storage]
        DP[datosperu.org]
        N8N[n8n Workflows]
        GOOGLE[Google OAuth]
    end

    API --> OCI
    PROD_API --> OCI
    SCR --> DP
    N8N --> SCR
    N8N --> PG
    AUTH --> GOOGLE
```

> **Nota:** El website local consume el API **local** (`localhost:4000`) que conecta
> a `empliq_pre_prod`. Supabase Auth (GoTrue) corre local para desarrollo de OAuth
> sin afectar producción. Para consumir la API de producción, cambiar
> `NEXT_PUBLIC_API_URL=https://api.empliq.io/api` en `docker/.env`.
>
> **Base de datos local:** `empliq_pre_prod` — staging con estructura Prisma idónea.
> GoTrue local también conecta a `empliq_pre_prod` (schema `auth` separado del `public`).

### Producción (Oracle Cloud ARM)

```mermaid
graph TB
    subgraph "Oracle Cloud ARM (163.176.250.185)"
        TRAEFIK[Traefik<br/>:443 HTTPS]
        PG[(musuq-postgres<br/>PostgreSQL 16)]
        REDIS[(musuq-redis)]
        BACKEND[empliq-backend<br/>api.empliq.io]
        AUTH[GoTrue<br/>auth.empliq.io]
        KONG[Kong<br/>auth.empliq.io]
        META[Postgres Meta]
        STUDIO_P[Studio<br/>studio.empliq.io]
        SCRAPER[Scraper<br/>scraper.empliq.io]
        N8N_P[n8n<br/>n8n.musuq.me]
        CW[Chatwoot<br/>app.musuq.me]
        AF[Affine<br/>affine.musuq.me]
        DOZ[Dozzle<br/>logs.musuq.me]
    end

    INET((Internet)) --> TRAEFIK
    TRAEFIK --> BACKEND
    TRAEFIK --> KONG
    TRAEFIK --> STUDIO_P
    TRAEFIK --> SCRAPER
    TRAEFIK --> N8N_P
    TRAEFIK --> CW
    TRAEFIK --> AF
    TRAEFIK --> DOZ
    KONG --> AUTH
    AUTH --> PG
    BACKEND --> PG
    SCRAPER --> PG
    N8N_P --> PG
    CW --> PG
    CW --> REDIS
    META --> PG
    STUDIO_P --> META

    subgraph "Externo"
        OCI[Oracle Object Storage<br/>sa-saopaulo-1]
        CF[Cloudflare DNS]
        GOOGLE[Google OAuth]
    end

    BACKEND --> OCI
    TRAEFIK --> CF
    AUTH --> GOOGLE
```

---

## Arquitectura Hexagonal (API)

```mermaid
graph LR
    subgraph "Infrastructure Layer"
        HTTP[HTTP Controllers]
        PRISMA[Prisma Repositories]
        AUTH[Supabase Auth Guard]
        STORE[Oracle Storage]
    end

    subgraph "Application Layer"
        UC[Use Cases]
    end

    subgraph "Domain Layer"
        ENT[Entities]
        REPO[Repository Interfaces<br/><i>Ports</i>]
    end

    HTTP --> UC
    UC --> REPO
    REPO -.-> ENT
    PRISMA -.implements.-> REPO
    UC --> AUTH
    UC --> STORE
```

**Principio:** El dominio no depende de nada externo. Los puertos (interfaces) viven en `domain/`, las implementaciones en `infrastructure/`.

---

## Flujo de Datos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant W as Website (Next.js :3000)
    participant K as Kong (:8000)
    participant G as GoTrue (:9999)
    participant A as API (api.empliq.io)
    participant DB as PostgreSQL

    U->>W: Visita landing / app
    W-->>U: Render SSR

    Note over U,G: Flujo OAuth (local)
    U->>W: Click "Continuar con Google"
    W->>K: supabase.auth.signInWithOAuth()
    K->>G: /auth/v1/authorize?provider=google
    G-->>U: Redirect a Google
    U-->>G: Callback con code
    G->>DB: Crear/actualizar auth.users
    G-->>W: Redirect con session code
    W-->>U: JWT en cookie

    Note over U,DB: Flujo de datos (producción)
    U->>W: Navega a /empresas
    W->>A: GET /api/companies (Authorization: Bearer jwt)
    A->>DB: SELECT companies
    DB-->>A: Datos
    A-->>W: JSON response
    W-->>U: Render page
```

---

## Pipeline de Datos (Scraping)

```mermaid
flowchart LR
    CSV[CSV Empresas<br/>22,939 RUCs] --> N8N[n8n Workflow]
    N8N --> SCR[Scraper API<br/>/enrich/datosperu]
    SCR --> DP[datosperu.org]
    DP --> SCR
    SCR --> N8N
    N8N --> DEV[(empliq_dev<br/>companies_raw<br/>JSONB)]
    DEV --> ETL[migrate_companies.py<br/>SSH tunnel]
    ETL --> PRE[(empliq_pre_prod<br/>companies<br/>Prisma)]
    PRE -->|validado| PROD[(empliq_prod<br/>companies<br/>Prisma)]
```

**Estado actual:** ~19,000+ empresas enriquecidas en empliq_dev (Tier 1-5).

### Arquitectura de 3 Bases de Datos

| BD | Host | Propósito | Schema |
|---|---|---|---|
| `empliq_dev` | Oracle Cloud (musuq-postgres) | Raw data scrapers (JSONB) | `companies_raw` sin estructura |
| `empliq_pre_prod` | Local Docker (empliq-postgres) | Staging/testing con Prisma | Prisma schema + auth |
| `empliq_prod` | Oracle Cloud (musuq-postgres) | Producción real | Prisma schema + auth |

**Regla:** Los datos fluyen `empliq_dev → empliq_pre_prod → empliq_prod`. Nunca al revés.
Ver `docs/technical/DATABASE_SAFETY.md` para reglas críticas.

---

## Modelo de Datos (ER Simplificado)

```mermaid
erDiagram
    USERS ||--o{ SALARIES : reports
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ INTERVIEWS : shares
    USERS ||--o{ DOCUMENTS : uploads
    COMPANIES ||--o{ DEPARTMENTS : has
    COMPANIES ||--o{ POSITIONS : has
    COMPANIES ||--o{ ORG_NODES : has
    COMPANIES ||--o{ ORG_EDGES : has
    DEPARTMENTS ||--o{ POSITIONS : contains
    POSITIONS ||--o{ SALARIES : receives
    POSITIONS ||--o{ COMMENTS : receives
    POSITIONS ||--o{ INTERVIEWS : receives
    POSITIONS ||--o{ DOCUMENTS : receives
    ORG_NODES ||--o| POSITIONS : links_to

    COMPANIES {
        uuid id PK
        string ruc UK
        string name
        string slug UK
        json metadata
    }
    POSITIONS {
        uuid id PK
        uuid company_id FK
        uuid department_id FK
        string title
        string level
    }
    SALARIES {
        uuid id PK
        uuid position_id FK
        string user_id FK
        decimal amount
        string currency
    }
```

---

## Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| Website | Next.js | 16.x | Landing SSR + App |
| UI Kit | TailwindCSS + shadcn/ui | 4.x | Estilos utility-first |
| Organigrama | ReactFlow | - | Visualización interactiva |
| 3D | Three.js | - | Shader background |
| Animaciones | Framer Motion | - | Micro-interacciones |
| Backend | NestJS | 11.x | API REST (hexagonal) |
| ORM | Prisma | 6.x | Abstracción DB |
| Base de datos | PostgreSQL | 16.x | Persistencia |
| Auth | Supabase GoTrue | v2.158.1 | Google OAuth self-hosted |
| API Gateway | Kong | 2.8.1 | Proxy /auth/v1/* → GoTrue |
| Storage | Oracle Object Storage | - | Logos, archivos (PAR upload) |
| Scraper | NestJS microservice | - | DatosPeru enrichment |
| Automatización | n8n | - | Pipelines de datos |
| Infra | Oracle Cloud ARM | A1.Flex 4c/24GB | Servidor producción |
| Reverse Proxy | Traefik | 3.x | HTTPS + routing (Cloudflare DNS) |
| Containers | Docker + Compose | - | Entorno dev/prod |
| CI/CD | GitHub Actions | - | Deploy automático |

---

## Subdominios de Producción

| Subdominio | Servicio | Descripción |
|------------|----------|-------------|
| `api.empliq.io` | empliq-backend | Backend API (NestJS) |
| `auth.empliq.io` | empliq-kong | Supabase API Gateway (GoTrue) |
| `studio.empliq.io` | empliq-studio | Dashboard Supabase |
| `scraper.empliq.io` | empliq-scraper | Scraper API |
| `n8n.musuq.me` | n8n | Automatización |
| `app.musuq.me` | chatwoot | Soporte |
| `affine.musuq.me` | affine | Docs/Whiteboard |
| `logs.musuq.me` | dozzle | Log viewer |
| `traefik.musuq.me` | traefik | Dashboard Traefik |

---

## Repos

| Repo | Contenido | Deploy |
|------|-----------|--------|
| `CareerWiki` (monorepo) | `apps/{api, website, empliq-scraper-api}`, docs, scripts | — |
| `empliq-backend` | Backend API standalone (clon de `apps/api`) | `api.empliq.io` |
| `musuq-platform` | Scripts infra Oracle Cloud, CI/CD, Docker services | Oracle ARM |

---

## Decisiones Arquitectónicas

Las decisiones técnicas importantes están documentadas como ADRs en [`decisions/`](./decisions/).

| ADR | Decisión |
|-----|----------|
| [001](./decisions/001-hexagonal-architecture.md) | Arquitectura hexagonal para API y Scraper |
| [002](./decisions/002-better-auth.md) | Supabase Self-Hosted (GoTrue) para Auth |
| [003](./decisions/003-dual-database-jsonb.md) | Dual DB: JSONB para scraper, Prisma para app |
| [004](./decisions/004-datosperu-only-pipeline.md) | Pipeline solo DatosPeru (sin búsqueda web) |
| [005](./decisions/005-monochromatic-design.md) | Diseño monocromático para website |
| [006](./decisions/006-oracle-cloud-arm.md) | Oracle Cloud ARM para producción |

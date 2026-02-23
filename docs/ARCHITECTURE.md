# Empliq — Arquitectura del Sistema

> Diagramas y descripción de la arquitectura. Documenta el **por qué**, no el **qué**.

---

## Diagrama de Contenedores (Docker)

```mermaid
graph TB
    subgraph "Docker Compose (dev)"
        PG[(PostgreSQL 16<br/>:5432)]
        API[NestJS API<br/>:4000]
        FE[React + Vite<br/>:5173]
        WEB[Next.js Website<br/>:3000]
        SCR[Scraper API<br/>:3457]
    end

    USER((Usuario)) --> WEB
    USER --> FE
    FE --> API
    API --> PG
    SCR --> PG
    WEB -.-> API

    subgraph "Externo"
        OCI[Oracle Object Storage]
        DP[datosperu.org]
        N8N[n8n Workflows]
    end

    API --> OCI
    SCR --> DP
    N8N --> SCR
    N8N --> PG
```

---

## Arquitectura Hexagonal (API)

```mermaid
graph LR
    subgraph "Infrastructure Layer"
        HTTP[HTTP Controllers]
        PRISMA[Prisma Repositories]
        AUTH[Better Auth]
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
    participant W as Website (Next.js)
    participant F as Frontend (React)
    participant A as API (NestJS)
    participant DB as PostgreSQL

    U->>W: Visita landing
    W-->>U: Render SSR
    U->>F: Click "Comenzar gratis"
    F->>A: POST /api/auth/sign-in
    A->>DB: Validar/crear sesión
    DB-->>A: Session token
    A-->>F: Cookie httpOnly
    F->>A: GET /api/companies
    A->>DB: SELECT companies
    DB-->>A: Datos
    A-->>F: JSON response
    F-->>U: Render dashboard
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
    N8N --> DB[(companies_raw<br/>JSONB)]
    DB --> ETL[ETL Script]
    ETL --> PROD[(companies<br/>Prisma)]
```

**Estado actual:** Tier 1-3 completado (6,123 empresas). Tier 4-5 pendiente (16,816).

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
| Frontend App | React + Vite | 19.x / 6.x | Dashboard SPA |
| Website | Next.js | 16.x | Landing SSR |
| UI Kit | TailwindCSS + shadcn/ui | 4.x | Estilos utility-first |
| Organigrama | ReactFlow | - | Visualización interactiva |
| 3D | Three.js | - | Shader background |
| Animaciones | Framer Motion | - | Micro-interacciones |
| Backend | NestJS | 11.x | API REST (hexagonal) |
| ORM | Prisma | 6.x | Abstracción DB |
| Base de datos | PostgreSQL | 16.x | Persistencia |
| Auth | Better Auth | - | Sesiones + OAuth |
| Storage | Oracle Object Storage | - | Logos, archivos |
| Scraper | NestJS microservice | - | DatosPeru enrichment |
| Automatización | n8n | - | Pipelines de datos |
| Infra | Oracle Cloud ARM | - | Servidor producción |
| Reverse Proxy | Traefik | - | HTTPS + routing |
| Containers | Docker + Compose | - | Entorno dev/prod |

---

## Decisiones Arquitectónicas

Las decisiones técnicas importantes están documentadas como ADRs en [`decisions/`](./decisions/).

| ADR | Decisión |
|-----|----------|
| [001](./decisions/001-hexagonal-architecture.md) | Arquitectura hexagonal para API y Scraper |
| [002](./decisions/002-better-auth.md) | Better Auth sobre Passport/Supabase Auth |
| [003](./decisions/003-dual-database-jsonb.md) | Dual DB: JSONB para scraper, Prisma para app |
| [004](./decisions/004-datosperu-only-pipeline.md) | Pipeline solo DatosPeru (sin búsqueda web) |
| [005](./decisions/005-monochromatic-design.md) | Diseño monocromático para website |
| [006](./decisions/006-oracle-cloud-arm.md) | Oracle Cloud ARM para producción |

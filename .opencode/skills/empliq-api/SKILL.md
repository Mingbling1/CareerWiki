---
name: empliq-api
description: NestJS backend API with hexagonal architecture, Prisma ORM, endpoints, entities, use cases, and Oracle Object Storage
---

# Empliq API (`apps/api/`)

NestJS backend con arquitectura hexagonal. Puerto 4000. Produccion: `https://api.empliq.io/api` (repo: `empliq-backend`).

## Estructura

```
src/
├── domain/
│   ├── entities/          # 8 entidades de dominio
│   └── repositories/      # 8 interfaces (ports)
├── application/
│   └── use-cases/         # 11 casos de uso
└── infrastructure/
    ├── auth/              # SupabaseAuthGuard + SupabaseService
    ├── http/
    │   ├── controllers/   # 5 REST controllers
    │   ├── dto/           # Request/response DTOs
    │   └── modules/       # 5 NestJS modules
    ├── persistence/
    │   ├── prisma/        # PrismaService + PrismaModule
    │   └── repositories/  # 5 implementaciones Prisma
    └── storage/           # Oracle Object Storage service (PAR upload)
```

## Principio hexagonal

El dominio no depende de nada externo. Los puertos (interfaces) viven en `domain/`, las implementaciones en `infrastructure/`.

## Entidades

| Entidad | Relaciones |
|---------|------------|
| Company | -> departments, positions, orgNodes, orgEdges |
| Department | -> company, positions |
| Position | -> company, department, salaries, comments, interviews, documents |
| OrgNode | -> company, position, parent/children |
| Salary | -> position, user |
| Comment | -> position, user |
| Interview | -> position, user |
| Document | -> position, user |

## Endpoints (Use Cases)

| Caso de Uso | Endpoint | Metodo |
|-------------|----------|--------|
| GetCompanies | `/api/companies` | GET |
| GetCompanyBySlug | `/api/companies/:slug` | GET |
| CreateCompany | `/api/companies` | POST |
| UpdateCompany | `/api/companies/:id` | PUT |
| GetOrganigrama | `/api/org-nodes/:companyId` | GET |
| GetPositionsByCompany | `/api/positions?companyId=` | GET |
| AddSalary | `/api/salaries` | POST |
| GetSalaryStats | `/api/salaries/stats?positionId=` | GET |
| AddComment | `/api/comments` | POST |
| GetComments | `/api/comments?positionId=` | GET |

## Auth

- Supabase GoTrue self-hosted (NO Better Auth)
- OAuth (Google) via Kong (`/auth/v1/*`)
- API recibe JWTs en header `Authorization: Bearer <jwt>`
- `SupabaseAuthGuard` valida JWT y extrae usuario
- `@CurrentUser()` decorator para acceder al user en controllers
- AuthModule es `@Global()` — disponible en toda la app

## Storage

NO usa Supabase Storage. Archivos van a Oracle Object Storage via PAR (Pre-Authenticated Request) con `fetch()` PUT.
Archivo: `src/infrastructure/storage/storage.service.ts`

## Variables de entorno

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://empliq:empliq_dev_password@localhost:5432/empliq_pre_prod
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
SUPABASE_URL=http://localhost:8000
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ORACLE_PAR_UPLOAD_URL=https://objectstorage.../o/
ORACLE_PUBLIC_URL_BASE=https://objectstorage.../o/
```

## Repos y sincronizacion

- Monorepo: `CareerWiki/apps/api/` — desarrollo local
- Deploy: `empliq-backend` — repo standalone para produccion
- Cuando se modifica `apps/api/`, sincronizar cambios a `empliq-backend` y hacer push.

## Pendiente

- Validacion de datos en salarios
- Calculo de media/mediana/rango
- Middleware de proteccion de rutas
- Roles admin/user
- Rate limiting
- Seed de datos iniciales

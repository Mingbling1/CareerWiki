# App: API (`apps/api/`)

> NestJS backend con arquitectura hexagonal. Puerto: 4000.
>
> **Producción:** `https://api.empliq.io/api` (repo: `empliq-backend`)

## Resumen

API REST principal de Empliq. Gestiona empresas, puestos, salarios, comentarios, organigramas y autenticación.

El **website local consume la API de producción** por defecto. El API local (:4000) se mantiene para desarrollo/pruebas de endpoints.

## Repos

| Repo | Propósito |
|------|-----------|
| `CareerWiki` (monorepo) `apps/api/` | Desarrollo local, código fuente |
| `empliq-backend` | Deploy a producción (`api.empliq.io`) |

Cuando se modifica `apps/api/`, sincronizar cambios a `empliq-backend` y hacer push.

## Estructura

```
src/
├── domain/
│   ├── entities/          # 8 entidades de dominio
│   └── repositories/      # 8 interfaces (ports)
├── application/
│   └── use-cases/         # 11 casos de uso
└── infrastructure/
    ├── auth/              # Better Auth (controller + config)
    ├── http/
    │   ├── controllers/   # 5 REST controllers
    │   ├── dto/           # Request/response DTOs
    │   └── modules/       # 5 NestJS modules
    ├── persistence/
    │   ├── prisma/        # PrismaService + PrismaModule
    │   └── repositories/  # 5 implementaciones Prisma
    └── storage/           # Oracle Object Storage service
```

## Entidades

| Entidad | Archivo | Relaciones |
|---------|---------|------------|
| Company | `company.entity.ts` | → departments, positions, orgNodes, orgEdges |
| Department | — (inline en Prisma) | → company, positions |
| Position | `position.entity.ts` | → company, department, salaries, comments, interviews, documents |
| OrgNode | `org-node.entity.ts` | → company, position, parent/children |
| Salary | `salary.entity.ts` | → position, user |
| Comment | `comment.entity.ts` | → position, user |
| Interview | `interview.entity.ts` | → position, user |
| Document | `document.entity.ts` | → position, user |

## Use Cases

| Caso de Uso | Endpoint | Método |
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

La autenticación usa **Supabase GoTrue** self-hosted (no Better Auth).

- OAuth (Google) se maneja en GoTrue via Kong (`/auth/v1/*`)
- El API recibe JWTs en header `Authorization: Bearer <jwt>`
- `SupabaseAuthGuard` valida el JWT y extrae el usuario

## Variables de Entorno

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://empliq:empliq_dev_password@localhost:5432/empliq
CORS_ORIGINS=http://localhost:3000
SUPABASE_URL=http://localhost:8000
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ORACLE_PAR_UPLOAD_URL=https://objectstorage.../o/
ORACLE_PUBLIC_URL_BASE=https://objectstorage.../o/
```

## Storage

**No usa Supabase Storage.** Los archivos se suben a Oracle Object Storage
usando PAR (Pre-Authenticated Request) con `fetch()` PUT.

Archivo: `src/infrastructure/storage/storage.service.ts`

## Pendiente

- [ ] Validación de datos en salarios
- [ ] Cálculo de media/mediana/rango
- [ ] Middleware de protección de rutas
- [ ] Roles admin/user
- [ ] Rate limiting
- [ ] Seed de datos iniciales

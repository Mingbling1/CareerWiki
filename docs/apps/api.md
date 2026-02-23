# App: API (`apps/api/`)

> NestJS backend con arquitectura hexagonal. Puerto: 4000.

## Resumen

API REST principal de Empliq. Gestiona empresas, puestos, salarios, comentarios, organigramas y autenticación.

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

## Auth Endpoints

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/auth/sign-up/email` | Registro |
| `POST /api/auth/sign-in/email` | Login |
| `GET /api/auth/sign-in/social` | OAuth redirect |
| `GET /api/auth/get-session` | Sesión actual |
| `POST /api/auth/sign-out` | Cerrar sesión |

## Variables de Entorno

```env
DATABASE_URL=postgresql://user:password@localhost:5432/empliq
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:4000
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
ORACLE_PAR_UPLOAD_URL=https://objectstorage.../o/
ORACLE_PUBLIC_URL_BASE=https://objectstorage.../o/
```

## Pendiente

- [ ] Validación de datos en salarios
- [ ] Cálculo de media/mediana/rango
- [ ] Middleware de protección de rutas
- [ ] Roles admin/user
- [ ] Rate limiting
- [ ] Seed de datos iniciales

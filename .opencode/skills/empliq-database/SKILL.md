---
name: empliq-database
description: PostgreSQL schema, Prisma ORM practices, 3-database architecture, data migration pipeline, and safety rules
---

# Empliq Database

PostgreSQL 16 con Prisma 6. Arquitectura de 3 bases de datos.

## 3 Bases de datos

| BD | Host | Proposito | Seguridad |
|---|---|---|---|
| `empliq_dev` | Oracle Cloud (musuq-postgres) | Raw data scrapers (JSONB `companies_raw`). Crece diariamente. | Se puede resetear |
| `empliq_pre_prod` | Local Docker (empliq-postgres) | Staging con Prisma schema + GoTrue local. | Se puede resetear |
| `empliq_prod` | Oracle Cloud (musuq-postgres) | Produccion. Datos de usuarios reales. | NUNCA modificar directamente |

**Flujo:** `empliq_dev -> empliq_pre_prod -> empliq_prod`. Nunca al reves.

## Reglas criticas

1. **NUNCA** modificar `empliq_prod` directamente (no SQL directo, no `prisma db push`, no `--reset`)
2. **Prisma es la fuente de verdad** del schema (`apps/api/prisma/schema.prisma`)
3. **Local:** `prisma db push` (rapido, sin historial)
4. **Produccion:** `prisma migrate dev` -> `prisma migrate deploy` (con historial)
5. Schema `auth` (GoTrue) y schema `public` (Prisma) son independientes
6. La tabla `_migration_log` NO esta en Prisma (es tracking de migracion de datos)

## Schema principal (public)

```
profiles        -> vinculado a auth.users por UUID (id = auth.users.id)
companies       -> ruc (unique), slug (unique), metadata (JSONB)
job_categories  -> categorias de trabajo
positions       -> company_id, department_id, title, level
salaries        -> position_id, user_id, amount, currency, period
reviews         -> position_id, user_id, rating, title, comment
interviews      -> position_id, user_id, process, difficulty
benefits        -> company_id, name, category, description
_migration_log  -> tracking de migracion (fuera de Prisma)
```

## Cambios de schema (paso a paso)

1. Editar `apps/api/prisma/schema.prisma`
2. Aplicar a pre_prod: `DATABASE_URL=...empliq_pre_prod npx prisma db push`
3. Probar app localmente
4. Crear migracion: `npx prisma migrate dev --name descripcion`
5. Aplicar a produccion: `DATABASE_URL=...empliq_prod npx prisma migrate deploy`

## DATABASE_URLs

| Entorno | Valor |
|---|---|
| API local (.env) | `postgresql://empliq:empliq_dev_password@localhost:5432/empliq_pre_prod` |
| API Docker | `postgresql://empliq:empliq_dev_password@postgres:5432/empliq_pre_prod` |
| API produccion | `postgresql://postgres:postgres123@musuq-postgres:5432/empliq_prod` |

## Migracion de datos

Script: `scripts/migrate_companies.py` (SSH tunnel + psycopg2)

| Metodo | Cuando | Velocidad |
|---|---|---|
| `migrate_companies.py --mode=local` | Migrar a pre_prod local | ~500/10min |
| `dblink_migration.sql` | Migrar a prod (same container) | ~25K en <2 min |

Migracion incremental: solo RUCs nuevos, idempotente, tolerante a fallos.

## Peligros

- Si se borra/recrea la BD, GoTrue pierde TODAS las sesiones y usuarios
- `profiles` tiene ON DELETE CASCADE en salaries, reviews, interviews
- `prisma db push` puede causar errores temporales si el backend esta corriendo
- Reiniciar backend despues de cambios: `docker restart empliq-api`

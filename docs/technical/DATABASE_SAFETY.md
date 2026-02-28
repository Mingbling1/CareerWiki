# Base de Datos — Reglas de Seguridad y Prácticas

> **Última actualización:** 24 de febrero de 2026
> **DOCUMENTO CRÍTICO** — Leer antes de cualquier modificación a la base de datos.

---

## Resumen de Entornos

```
LOCAL (tu máquina)                     PRODUCCIÓN (Oracle Cloud)
─────────────────                      ──────────────────────────
empliq_pre_prod ← Backend local        empliq_prod ← Backend prod
                ← GoTrue local                     ← GoTrue prod
                ← Prisma db push                   ← Prisma migrate deploy
```

###  Regla #1: NUNCA modificar empliq_prod directamente

- No ejecutar SQL directo contra empliq_prod
- No usar `prisma db push` contra empliq_prod
- No hacer `--reset` contra empliq_prod
- Siempre usar `prisma migrate deploy` para cambios de schema en producción
- Siempre probar TODO en empliq_pre_prod primero

###  Regla #2: Prisma es la fuente de verdad del schema

- El archivo `apps/api/prisma/schema.prisma` define la estructura
- **Local (pre_prod)**: `prisma db push` (rápido, sin historial — OK para staging)
- **Producción**: `prisma migrate dev` → `prisma migrate deploy` (con historial, reversible)
- **NUNCA** crear/modificar tablas con SQL directo en producción

---

## Cómo hacer cambios de schema (paso a paso)

### 1. Modificar Prisma schema
```bash
# Editar apps/api/prisma/schema.prisma
```

### 2. Aplicar a pre_prod (local)
```bash
cd apps/api
DATABASE_URL="postgresql://empliq:empliq_dev_password@localhost:5432/empliq_pre_prod" \
  npx prisma db push
```

### 3. Probar la app localmente
- Verificar que el backend local (:4000) funciona
- Verificar que OAuth (GoTrue) no se rompe
- Verificar que los endpoints devuelven data correcta

### 4. Crear migración formal (para producción)
```bash
cd apps/api
DATABASE_URL="postgresql://empliq:empliq_dev_password@localhost:5432/empliq_pre_prod" \
  npx prisma migrate dev --name descripcion_del_cambio
```
Esto genera un archivo SQL en `prisma/migrations/` que es reproducible e idempotente.

### 5. Aplicar a producción
```bash
cd apps/api
DATABASE_URL="postgresql://postgres:postgres123@163.176.250.185:5432/empliq_prod" \
  npx prisma migrate deploy
```

---

## Peligros Identificados

### 1. GoTrue (auth) y cambios de schema

GoTrue gestiona el schema `auth` (tablas `auth.users`, `auth.sessions`, etc.).
Prisma gestiona el schema `public` (tablas `companies`, `profiles`, etc.).

**Peligro:** Si se borra o recrea la base de datos, GoTrue pierde TODAS las sesiones y usuarios.

**Prevención:**
- Nunca `DROP DATABASE empliq_prod`
- Nunca `DROP SCHEMA auth CASCADE`
- Los cambios de schema en `public` NO afectan a `auth` (son schemas separados)
- Si GoTrue re-inicia contra una BD nueva, ejecuta 52 migraciones internas automáticamente

### 2. La tabla `profiles` vincula auth.users con datos de la app

```prisma
model Profile {
  id String @id @db.Uuid  // Este ID = auth.users.id de Supabase
  ...
}
```

**Peligro:** Si borras `profiles`, los usuarios pierden sus salarios, reviews, etc.

**Prevención:**
- Nunca `DELETE FROM profiles` en producción
- Los ON DELETE CASCADE de `salaries`, `reviews`, `interviews` borran en cascada
- Antes de migrar schema, verificar que no se altera la tabla `profiles`

### 3. prisma db push vs prisma migrate

| Comando | Uso | Riesgo |
|---|---|---|
| `prisma db push` | Solo para dev/staging | Puede borrar datos si cambia schema |
| `prisma migrate dev` | Crear migración con historial | Seguro, genera SQL reversible |
| `prisma migrate deploy` | Aplicar en producción | Seguro, aplica migraciones pendientes |

**Regla:** `prisma db push` solo contra `empliq_pre_prod`. NUNCA contra `empliq_prod`.

### 4. Migraciones de datos vs migraciones de schema

- **Schema** (estructura): Se gestiona con Prisma migrate
- **Datos** (filas): Se gestiona con `scripts/migrate_companies.py`
- Son procesos completamente separados y no deben mezclarse

### 5. La tabla `_migration_log` NO está en Prisma

`_migration_log` se crea en `docker/init-db.sql` y NO está en el schema de Prisma.
Esto es intencional: es una tabla de tracking de migración de datos, no de la app.

**Consecuencia:** `prisma db push` NO la borra ni la modifica.

### 6. Conexiones concurrentes

Si el backend está corriendo y se modifica el schema:
- `prisma db push` puede causar errores temporales en el backend
- Reiniciar el backend después de cambios: `docker restart empliq-api`
- En producción, coordinar deployments para minimizar downtime

---

## Checklist antes de modificar producción

- [ ] Cambio probado en `empliq_pre_prod` local
- [ ] OAuth funciona después del cambio (login, sesiones)
- [ ] API endpoints devuelven data correcta
- [ ] Migración creada con `prisma migrate dev`
- [ ] Backup de empliq_prod (opcional pero recomendado)
- [ ] `prisma migrate deploy` contra empliq_prod
- [ ] Restart del backend de producción
- [ ] Verificar api.empliq.io/api/companies funciona

---

## Estructura de la BD de producción (empliq_prod)

```
empliq_prod
├── auth schema (GoTrue — 52 tablas internas)
│   ├── auth.users
│   ├── auth.sessions
│   ├── auth.refresh_tokens
│   ├── auth.identities
│   └── ... (no tocar)
│
├── public schema (Prisma — app)
│   ├── profiles (vinculado a auth.users por UUID)
│   ├── companies
│   ├── job_categories
│   ├── positions
│   ├── salaries
│   ├── reviews
│   ├── interviews
│   ├── benefits
│   └── _migration_log (tracking, fuera de Prisma)
│
└── _prisma_migrations (tabla interna de Prisma migrate)
```

---

## Resumen de DATABASE_URLs

| Entorno | Variable | Valor |
|---|---|---|
| API local (.env) | `DATABASE_URL` | `postgresql://empliq:empliq_dev_password@localhost:5432/empliq_pre_prod` |
| API Docker (compose) | `DATABASE_URL` | `postgresql://empliq:empliq_dev_password@postgres:5432/empliq_pre_prod` |
| GoTrue local (compose) | `GOTRUE_DB_DATABASE_URL` | `postgres://supabase_auth_admin:...@postgres:5432/empliq_pre_prod` |
| API producción | `DATABASE_URL` | `postgresql://postgres:postgres123@musuq-postgres:5432/empliq_prod` |
| GoTrue producción | `GOTRUE_DB_DATABASE_URL` | `postgres://supabase_auth_admin:...@musuq-postgres:5432/empliq_prod` |

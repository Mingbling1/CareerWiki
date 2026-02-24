# ADR-002: Supabase Self-Hosted (GoTrue) para Autenticación

**Fecha:** Enero 2026 (actualizado Febrero 2026)
**Estado:** Aceptado (reemplaza Better Auth)

## Contexto

Necesitábamos autenticación con Google OAuth. Inicialmente usamos Better Auth, pero migramos a Supabase self-hosted para aprovechar:
- **RLS** (Row Level Security) en PostgreSQL, que configuraremos próximamente
- **OAuth gestionado** por GoTrue sin código custom
- **Ecosistema Supabase** (SDK, dashboard, auth listeners)

## Opciones Evaluadas

1. **Better Auth** — (anterior) Librería moderna pero con catch-all hack en NestJS
2. **Supabase Auth (GoTrue) self-hosted** — OAuth out-of-the-box, RLS nativo, Docker
3. **Passport.js** — Verbose, requiere mucha configuración manual

## Decisión

**Supabase Auth self-hosted** con GoTrue + Kong (API Gateway).

- **Solo Google OAuth** — NO hay login con email/password
- GoTrue se ejecuta como contenedor Docker independiente
- Kong proxy enruta `/auth/v1/*` a GoTrue
- Frontend usa `@supabase/ssr` + `@supabase/supabase-js`
- Backend (NestJS) verifica JWT tokens vía `@supabase/supabase-js`
- Tabla `profiles` en Prisma vinculada a `auth.users` de Supabase por UUID
- Oracle Object Storage se mantiene para archivos/logos

## Arquitectura Docker

```
Frontend (Next.js :3000)
    ↓
Kong (:8000) ──→ /auth/v1/* ──→ GoTrue (:9999)
    
NestJS API (:4000) ← verifica JWT con SUPABASE_JWT_SECRET
    ↓
PostgreSQL (:5432)
  ├── public schema (Prisma: companies, profiles, salaries...)
  └── auth schema (GoTrue: users, sessions, identities...)
```

## Consecuencias

- **Positivo:** RLS nativo en PostgreSQL para seguridad a nivel de fila
- **Positivo:** OAuth gestionado sin código custom en NestJS
- **Positivo:** SDK oficial con auth state listeners y session refresh
- **Positivo:** Self-hosted, sin lock-in a Supabase Cloud
- **Negativo:** Más servicios Docker (GoTrue + Kong)
- **Negativo:** Requiere generar/gestionar JWT_SECRET y ANON/SERVICE_ROLE keys

# Empliq - Autenticación

> Guía de implementación de autenticación con Supabase Self-Hosted (GoTrue).

## Índice

1. [Arquitectura de Auth](#arquitectura-de-auth)
2. [Configuración Docker](#configuración-docker)
3. [Implementación en Next.js](#implementación-en-nextjs)
4. [Implementación en NestJS](#implementación-en-nestjs)
5. [Flujo de Google OAuth](#flujo-de-google-oauth)

---

## Arquitectura de Auth

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FLUJO DE AUTH (Supabase)                       │
│                                                                     │
│  Usuario                                                            │
│     │                                                               │
│     │ 1. Click "Continuar con Google"                              │
│     ▼                                                               │
│  ┌─────────────┐                                                   │
│  │  Next.js    │ 2. supabase.auth.signInWithOAuth({ provider:     │
│  │  (Website)  │    'google', redirectTo: '/auth/callback' })      │
│  └──────┬──────┘                                                   │
│         │                                                          │
│         │ 3. Redirect a Google → Callback a GoTrue                │
│         ▼                                                          │
│  ┌─────────────────┐                                               │
│  │   Kong :8000    │── proxy ──→ /auth/v1/* ──→ GoTrue :9999      │
│  └────────┬────────┘                                               │
│           │                                                        │
│           │ 4. GoTrue crea/actualiza auth.users                   │
│           ▼                                                        │
│  ┌─────────────────┐                                               │
│  │   PostgreSQL    │                                               │
│  │  auth.users     │ (GoTrue managed)                             │
│  │  public.profiles│ (Prisma managed)                             │
│  └────────┬────────┘                                               │
│           │                                                        │
│           │ 5. Redirect a /auth/callback con code                 │
│           ▼                                                        │
│  ┌─────────────┐                                                   │
│  │  Next.js    │ 6. exchangeCodeForSession(code)                  │
│  │  Route      │    → JWT token en cookies httpOnly               │
│  └──────┬──────┘                                                   │
│         │                                                          │
│         │ 7. API calls con Authorization: Bearer <jwt>            │
│         ▼                                                          │
│  ┌─────────────────┐                                               │
│  │    NestJS       │ 8. SupabaseAuthGuard verifica JWT            │
│  │  API :4000      │    → req.user = Supabase User                │
│  └─────────────────┘                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Configuración Docker

### Servicios necesarios

| Servicio | Imagen | Puerto | Propósito |
|----------|--------|--------|-----------|
| `postgres` | `postgres:16-alpine` | 5432 | BD con schema `auth` + `public` |
| `supabase-auth` | `supabase/gotrue:v2.158.1` | 9999 (interno) | OAuth, sesiones, JWT |
| `supabase-kong` | `kong:2.8.1` | 8000 | API Gateway para auth routing |
| `supabase-meta` | `supabase/postgres-meta:v0.95.2` | 8080 (interno) | API REST para Postgres (Studio) |
| `supabase-studio` | `supabase/studio` | 54323 | Dashboard gráfico de Supabase |

### Variables de Entorno

```env
# .env (docker/)
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PG_META_CRYPTO_KEY=<clave-de-al-menos-32-caracteres>
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

> Las keys de demo son para desarrollo local. Generar keys propias para producción.

### Roles de PostgreSQL (requeridos por GoTrue)

GoTrue necesita roles específicos en PostgreSQL. El `init-db.sql` los crea
automáticamente, siguiendo la guía oficial:
[supabase.com/docs/guides/self-hosting/docker](https://supabase.com/docs/guides/self-hosting/docker)

| Rol | Tipo | Propósito |
|-----|------|-----------|
| `supabase_auth_admin` | LOGIN, SUPERUSER | GoTrue se conecta con este rol |
| `anon` | NOLOGIN | Claim en JWTs para requests sin autenticar |
| `authenticated` | NOLOGIN | Claim en JWTs para usuarios autenticados |
| `service_role` | NOLOGIN, BYPASSRLS | Backend con acceso total |
| `authenticator` | LOGIN | PostgREST, puede cambiar a los roles anteriores |

**GoTrue DATABASE_URL:**
```
postgres://supabase_auth_admin:supabase_auth_admin_password@postgres:5432/empliq
```

### Supabase Studio

Dashboard gráfico disponible en: **http://localhost:54323**

Requiere los servicios `supabase-meta` y `supabase-studio`.
Permite gestionar usuarios, tablas, políticas RLS, etc.

---

## Implementación en Next.js

### 1. Cliente Browser (Client Components)

**`/apps/website/src/lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

### 2. Cliente Server (Server Components / Route Handlers)

**`/apps/website/src/lib/supabase/server.ts`**

Usa `createServerClient` con gestión de cookies de Next.js.

### 3. Middleware (Session Refresh)

**`/apps/website/src/middleware.ts`**

Refresca el JWT token automáticamente en cada request.

### 4. Auth Callback

**`/apps/website/src/app/auth/callback/route.ts`**

Intercambia el OAuth code por una session con `exchangeCodeForSession()`.

### 5. Uso en Componentes

```tsx
"use client"
import { createClient } from "@/lib/supabase/client"

function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }
  return <button onClick={handleLogin}>Continuar con Google</button>
}
```

---

## Implementación en NestJS

### 1. SupabaseService

Wrapper del client `@supabase/supabase-js` con `SERVICE_ROLE_KEY`.
Expone `getUser(token)` para verificar JWT tokens.

### 2. SupabaseAuthGuard

NestJS Guard que:
1. Extrae `Bearer <token>` del header `Authorization`
2. Verifica el token via `supabase.auth.getUser(token)`
3. Adjunta el user a `req.user`

### 3. @CurrentUser() Decorator

```typescript
@UseGuards(SupabaseAuthGuard)
@Get('me')
getMe(@CurrentUser() user) { return user; }
```

### 4. AuthModule

Registrado como `@Global()` — SupabaseService y SupabaseAuthGuard
disponibles en toda la aplicación sin importar manualmente.

---

## Flujo de Google OAuth

### Local (desarrollo)

1. **Usuario** → Click "Continuar con Google" en `/login`
2. **Next.js** → `supabase.auth.signInWithOAuth({ provider: 'google' })`
3. **Browser** → Redirect a `http://localhost:8000/auth/v1/authorize?provider=google`
4. **Kong** → Proxy a GoTrue
5. **GoTrue** → Redirect a Google OAuth consent screen
6. **Google** → Callback a `http://localhost:8000/auth/v1/callback`
7. **GoTrue** → Crea/actualiza `auth.users`, genera JWT
8. **GoTrue** → Redirect a `http://localhost:3000/auth/callback?code=...`
9. **Next.js Route** → `exchangeCodeForSession(code)` → Cookie de sesión
10. **Next.js** → Redirect a `/empresas`

### Producción

Mismo flujo pero con dominios reales:
- **NEXT_PUBLIC_SUPABASE_URL:** `https://auth.empliq.io`
- **GoTrue API_EXTERNAL_URL:** `https://auth.empliq.io`
- **Google callback:** `https://auth.empliq.io/auth/v1/callback`
- **GOTRUE_SITE_URL:** `https://empliq.io`
- **Redirect después de auth:** `https://empliq.io/auth/callback`

### Google Cloud Console Setup

**Desarrollo:**
- **Authorized redirect URI**: `http://localhost:8000/auth/v1/callback`
- **Authorized JavaScript origins**: `http://localhost:3000`

**Producción:**
- **Authorized redirect URI**: `https://auth.empliq.io/auth/v1/callback`
- **Authorized JavaScript origins**: `https://empliq.io`

---

## Modelo de Datos

### Auth (GoTrue managed — schema `auth`)

No visible en Prisma. GoTrue gestiona automáticamente:
- `auth.users` — usuarios autenticados
- `auth.sessions` — sesiones activas
- `auth.identities` — identidades OAuth
- `auth.refresh_tokens` — tokens de refresco

### Profile (Prisma managed — schema `public`)

```prisma
model Profile {
  id        String   @id @db.Uuid  // = auth.users.id
  email     String?
  name      String?
  avatarUrl String?  @map("avatar_url")
  role      String   @default("user")

  salaries   Salary[]
  reviews    Review[]
  interviews Interview[]

  @@map("profiles")
}
```

El Profile se crea la primera vez que el usuario interactúa con la API.

---

## Deploy en Producción (PostgreSQL Fix)

### Problema Original

GoTrue (Supabase Auth) fallaba con:
```
ERROR: type "auth.factor_type" does not exist (SQLSTATE 42704)
```

**Causa raíz:** El `init-db.sql` anterior no creaba los roles de PostgreSQL que
GoTrue necesita según la guía oficial de Supabase. GoTrue conectaba como `empliq`
en vez de `supabase_auth_admin`, y las migraciones en el schema `auth` quedaban
corruptas.

### Fix Aplicado (replicar en producción)

1. **Crear los roles necesarios** ejecutando en PostgreSQL:

```sql
-- Roles de API
CREATE ROLE anon NOLOGIN NOINHERIT;
CREATE ROLE authenticated NOLOGIN NOINHERIT;
CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;

-- GoTrue admin (con superuser para migraciones)
CREATE ROLE supabase_auth_admin
  NOINHERIT CREATEROLE LOGIN
  PASSWORD '<PASSWORD_SEGURO>';
ALTER ROLE supabase_auth_admin WITH SUPERUSER;

-- Authenticator (PostgREST)
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD '<PASSWORD_SEGURO>';
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;
GRANT supabase_auth_admin TO authenticator;
```

2. **Preparar el schema auth:**

```sql
-- Si hay un schema auth corrupto, eliminarlo
DROP SCHEMA IF EXISTS auth CASCADE;

-- Recrear con ownership correcto
CREATE SCHEMA auth AUTHORIZATION supabase_auth_admin;
GRANT ALL PRIVILEGES ON SCHEMA auth TO supabase_auth_admin;
GRANT USAGE ON SCHEMA auth TO authenticated, anon, service_role;
ALTER ROLE supabase_auth_admin SET search_path = 'auth';
```

3. **Configurar GoTrue** para conectar con el rol correcto:

```env
GOTRUE_DB_DATABASE_URL=postgres://supabase_auth_admin:<PASSWORD>@<HOST>:5432/<DB>
```

4. **Reiniciar GoTrue.** Aplicará las 52 migraciones automáticamente.

### Checklist para producción

- [x] Generar JWT_SECRET propio (`openssl rand -base64 48`)
- [x] Generar ANON_KEY y SERVICE_ROLE_KEY con el nuevo JWT_SECRET
- [x] Usar passwords seguros para `supabase_auth_admin` y `authenticator`
- [x] `API_EXTERNAL_URL` = `https://auth.empliq.io`
- [x] `GOTRUE_SITE_URL` = `https://empliq.io`
- [x] `GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI` = `https://auth.empliq.io/auth/v1/callback`
- [x] Kong expuesto en `auth.empliq.io` (Traefik labels)
- [ ] En Google Cloud Console: agregar redirect URI `https://auth.empliq.io/auth/v1/callback`

---

## Seguridad

- JWT tokens con expiración (1 hora, auto-refresh)
- Cookies httpOnly gestionadas por `@supabase/ssr`
- CORS configurado en Kong para `*` (origins)
- Solo Google OAuth — sin email/password
- `SERVICE_ROLE_KEY` solo en backend (bypass RLS)
- RLS (Row Level Security) por configurar

---

## Referencias

- [Supabase Auth Self-Hosting](https://supabase.com/docs/guides/self-hosting/docker)
- [Supabase + Next.js SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [GoTrue Docker Hub](https://hub.docker.com/r/supabase/gotrue)

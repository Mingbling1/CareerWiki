---
name: empliq-auth
description: Supabase GoTrue self-hosted authentication with Google OAuth, Kong gateway, JWT tokens, Next.js SSR integration, and NestJS guard
---

# Empliq Auth

Supabase GoTrue self-hosted para autenticacion. Google OAuth. JWT en cookies httpOnly.

## Arquitectura

```
Usuario -> Click "Continuar con Google"
  -> Next.js: supabase.auth.signInWithOAuth({ provider: 'google' })
  -> Kong :8000 (proxy /auth/v1/* -> GoTrue :9999)
  -> GoTrue: redirect a Google consent
  -> Google: callback con code
  -> GoTrue: crea/actualiza auth.users, genera JWT
  -> Redirect a /auth/callback con code
  -> Next.js: exchangeCodeForSession(code) -> JWT en cookie
  -> API calls con Authorization: Bearer <jwt>
  -> NestJS: SupabaseAuthGuard verifica JWT
```

## Servicios Docker

| Servicio | Imagen | Puerto | Proposito |
|----------|--------|--------|-----------|
| `postgres` | postgres:16-alpine | 5432 | BD con schema auth + public |
| `supabase-auth` | supabase/gotrue:v2.158.1 | 9999 (int) | OAuth, sesiones, JWT |
| `supabase-kong` | kong:2.8.1 | 8000 | API Gateway /auth/v1/* -> GoTrue |
| `supabase-meta` | supabase/postgres-meta | 8080 (int) | API REST para Studio |
| `supabase-studio` | supabase/studio | 54323 | Dashboard grafico |

## Implementacion Next.js

- **Browser client:** `createBrowserClient()` en `lib/supabase/client.ts`
- **Server client:** `createServerClient()` en `lib/supabase/server.ts` (con cookies)
- **Middleware:** `middleware.ts` refresca JWT automaticamente
- **Auth callback:** `app/auth/callback/route.ts` intercambia code por session

## Implementacion NestJS

- **SupabaseService:** wrapper de `@supabase/supabase-js` con SERVICE_ROLE_KEY. Expone `getUser(token)`.
- **SupabaseAuthGuard:** extrae Bearer token, verifica via `supabase.auth.getUser(token)`, adjunta a `req.user`.
- **@CurrentUser() decorator:** accede al user en controllers.
- **AuthModule:** registrado como `@Global()`.

## Roles PostgreSQL (requeridos por GoTrue)

| Rol | Tipo | Proposito |
|-----|------|-----------|
| `supabase_auth_admin` | LOGIN, SUPERUSER | GoTrue conecta con este rol |
| `anon` | NOLOGIN | JWTs sin autenticar |
| `authenticated` | NOLOGIN | JWTs autenticados |
| `service_role` | NOLOGIN, BYPASSRLS | Backend con acceso total |
| `authenticator` | LOGIN | PostgREST |

GoTrue DATABASE_URL: `postgres://supabase_auth_admin:<password>@postgres:5432/empliq`

## Modelo de datos

- **Schema auth** (GoTrue managed): auth.users, auth.sessions, auth.identities, auth.refresh_tokens (NO visible en Prisma)
- **Schema public** (Prisma managed): profiles (id = auth.users.id), con salaries, reviews, interviews

Profile se crea con trigger `handle_new_user()` en INSERT a auth.users.

## URLs por entorno

### Local
- NEXT_PUBLIC_SUPABASE_URL: `http://localhost:8000`
- GoTrue callback: `http://localhost:8000/auth/v1/callback`
- Google redirect URI: `http://localhost:8000/auth/v1/callback`

### Produccion
- NEXT_PUBLIC_SUPABASE_URL: `https://auth.empliq.io`
- API_EXTERNAL_URL: `https://auth.empliq.io`
- GOTRUE_SITE_URL: `https://empliq.io`
- Google redirect URI: `https://auth.empliq.io/auth/v1/callback`

## Seguridad

- JWT con expiracion (1 hora, auto-refresh)
- Cookies httpOnly via `@supabase/ssr`
- Solo Google OAuth (sin email/password)
- SERVICE_ROLE_KEY solo en backend
- RLS por configurar

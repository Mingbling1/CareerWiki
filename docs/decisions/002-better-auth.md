# ADR-002: Better Auth sobre Passport / Supabase Auth

**Fecha:** Enero 2026
**Estado:** Aceptado

## Contexto

Necesitamos autenticación con email/password y Google OAuth. La solución debe funcionar con NestJS y ser self-hosted (sin lock-in a Supabase).

## Opciones Evaluadas

1. **Passport.js** — Maduro pero verbose, configuración manual de sesiones/JWT
2. **Supabase Auth** — Lock-in a Supabase, difícil de self-host
3. **Better Auth** — Librería moderna, adapter para Prisma, OAuth out-of-the-box, sesiones con cookies httpOnly

## Decisión

Better Auth con Prisma adapter.

- Sesiones server-side con cookies httpOnly (más seguro que JWT en localStorage)
- Google OAuth con un solo `socialProviders.google` config
- Tablas gestionadas por Better Auth: `users`, `sessions`, `accounts`, `verifications`
- `toNodeHandler()` para integrar con NestJS como catch-all controller

## Consecuencias

- **Positivo:** Setup en <30 min, incluye OAuth, sesiones, CSRF
- **Positivo:** Compatible directo con Prisma (adapter oficial)
- **Positivo:** Self-hosted, sin dependencia de servicios externos
- **Negativo:** Librería relativamente nueva, menos documentación que Passport
- **Negativo:** El catch-all `@All('*')` en NestJS es un hack — no usa el pipeline de pipes/guards de Nest

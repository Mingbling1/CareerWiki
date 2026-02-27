# Cloudflare Workers Deployment — Website (Next.js)

> Guía completa para desplegar `apps/website` en Cloudflare Workers usando [OpenNext.js](https://opennext.js.org/cloudflare).

---

## Tabla de contenido

1. [Arquitectura](#arquitectura)
2. [Requisitos previos](#requisitos-previos)
3. [Configuración del proyecto](#configuración-del-proyecto)
4. [Variables de entorno](#variables-de-entorno)
5. [Deploy manual (CLI)](#deploy-manual-cli)
6. [CI/CD con GitHub Actions](#cicd-con-github-actions)
7. [Custom domain](#custom-domain)
8. [Limitaciones conocidas](#limitaciones-conocidas)
9. [Troubleshooting](#troubleshooting)

---

## Arquitectura

```
┌──────────────────────────────────────────────────┐
│  Cloudflare Edge (300+ PoPs)                     │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │  Cloudflare Worker (apps/website)           │ │
│  │  ├─ SSR pages (server components)           │ │
│  │  ├─ API routes (/api/*)                     │ │
│  │  └─ Middleware (auth, redirects)            │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Static Asset │  │  KV / R2 (cache, imgs)  │  │
│  │  CDN (/_next) │  │  (futuro, opcional)      │  │
│  └──────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────┘
           │
           │ HTTPS
           ▼
┌──────────────────────────────────────────────────┐
│  Oracle Cloud ARM (API Backend)                  │
│  ├─ NestJS API (:4000)                           │
│  ├─ PostgreSQL (:5432)                           │
│  └─ Supabase GoTrue (:8000)                      │
└──────────────────────────────────────────────────┘
```

**Flujo:** El Worker de Cloudflare sirve el SSR de Next.js en el edge. Las llamadas API se hacen al backend en Oracle Cloud (configurado vía `NEXT_PUBLIC_API_URL`).

---

## Requisitos previos

### 1. Cuenta y API Token de Cloudflare

1. Ir a [Cloudflare Dashboard](https://dash.cloudflare.com) → **My Profile** → **API Tokens**
2. Click **Create Token**
3. Usar template **Custom token** con estos permisos:

| Permiso | Acceso |
|---------|--------|
| **Account** → Workers Scripts | Edit |
| **Account** → Workers KV Storage | Edit |
| **Account** → Workers R2 Storage | Edit |
| **Zone** → Workers Routes | Edit |

4. Guardar el token generado — se usará como `CF_WORKERS_API_TOKEN`
5. También necesitas tu **Account ID**: Dashboard → Workers & Pages → Overview → lado derecho

### 2. Node.js y herramientas

```bash
node --version  # >= 20.x
npm --version   # >= 10.x
```

### 3. Wrangler CLI (se instala como devDependency)

```bash
cd apps/website
npx wrangler --version  # verificar que funciona
npx wrangler login      # autenticarse una vez (interactivo)
```

---

## Configuración del proyecto

### Archivos creados/modificados

| Archivo | Propósito |
|---------|-----------|
| `wrangler.jsonc` | Config de Cloudflare Worker |
| `open-next.config.ts` | Config del adaptador OpenNext |
| `public/_headers` | Headers de seguridad y cache |
| `.dev.vars` | Variables locales (NO commitear) |
| `next.config.ts` | Modificado para OpenNext dev |
| `package.json` | Scripts de deploy añadidos |

### Instalar dependencias

```bash
cd apps/website
npm install --save-dev @opennextjs/cloudflare wrangler
```

### wrangler.jsonc

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "empliq-website",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-06-01",
  "compatibility_flags": ["nodejs_compat"],

  // Assets (static files servidos por Cloudflare CDN)
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },

  // Variables de entorno — production
  "vars": {
    "NEXT_PUBLIC_API_URL": "https://api.empliq.io",
    "NEXT_PUBLIC_SUPABASE_URL": "https://auth.empliq.io",
    "ENVIRONMENT": "production"
  }

  // Para KV, R2, D1 (futuro):
  // "kv_namespaces": [{ "binding": "CACHE", "id": "xxx" }]
}
```

### open-next.config.ts

```typescript
import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;
```

### next.config.ts (modificado)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",  // Requerido por OpenNext
  reactCompiler: true,
};

export default nextConfig;
```

> **Nota:** `output: "standalone"` es requerido por OpenNext para generar el bundle del Worker.
> El `initOpenNextCloudflareForDev()` ya no es necesario en versiones recientes.

### public/_headers

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/illustrations/*
  Cache-Control: public, max-age=86400, s-maxage=604800
```

### .dev.vars (NO commitear — agregar a .gitignore)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### Scripts en package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "preview": "opennextjs-cloudflare build && wrangler dev",
    "deploy": "opennextjs-cloudflare build && wrangler deploy",
    "cf:build": "opennextjs-cloudflare build",
    "cf:typegen": "wrangler types"
  }
}
```

### .gitignore (agregar)

```
.open-next/
.dev.vars
.wrangler/
```

---

## Variables de entorno

### En Cloudflare Dashboard (Producción)

Workers & Pages → empliq-website → Settings → Variables and Secrets:

| Variable | Valor | Tipo |
|----------|-------|------|
| `NEXT_PUBLIC_API_URL` | `https://api.empliq.io` | Plain text |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://auth.empliq.io` | Plain text |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | **Encrypted** |

### En wrangler.jsonc (committed, no-secrets)

Las variables públicas (`NEXT_PUBLIC_*`) van en `vars` del wrangler.jsonc.  
Los secrets se configuran via dashboard o CLI:

```bash
npx wrangler secret put SUPABASE_SERVICE_KEY
```

---

## Deploy manual (CLI)

### Primer deploy

```bash
cd apps/website

# 1. Login (una sola vez)
npx wrangler login

# 2. Build + Deploy
npm run deploy
```

### Preview (local con runtime de Cloudflare)

```bash
npm run preview
# Abre http://localhost:8787
```

### Deploy a staging

```bash
npx wrangler deploy --env staging
```

Para esto, agregar en `wrangler.jsonc`:

```jsonc
{
  "env": {
    "staging": {
      "name": "empliq-website-staging",
      "vars": {
        "NEXT_PUBLIC_API_URL": "https://api-staging.empliq.io",
        "ENVIRONMENT": "staging"
      }
    }
  }
}
```

---

## CI/CD con GitHub Actions

### Secrets necesarios en GitHub

| Secret | Descripción |
|--------|-------------|
| `CF_WORKERS_API_TOKEN` | Token con permisos Workers:Edit (distinto al de musuq-platform) |
| `CF_WORKERS_ACCOUNT_ID` | ID de la cuenta Cloudflare |

> **IMPORTANTE:** NO confundir con `CLOUDFLARE_API_TOKEN` de musuq-platform (ese es para Traefik DNS Challenge y NO se toca).

### Workflow: `.github/workflows/deploy.yml`

> Este workflow vive en el repo **empliq-website** (standalone, NO en el monorepo).

```yaml
name: Deploy Website to Cloudflare Workers

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Build & Deploy to Cloudflare Workers
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build with OpenNext
        run: npx opennextjs-cloudflare build

      - name: Deploy to Cloudflare
        run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_WORKERS_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CF_WORKERS_ACCOUNT_ID }}
```

> **Importante:** El repo empliq-website es standalone (tiene su propio `package.json` y `package-lock.json`).
> `npm ci` instala TODAS las dependencias localmente, incluyendo `next`, `wrangler` y `@opennextjs/cloudflare`.
> En el monorepo, el build falla porque npm workspaces hoistea `next` a la raíz y el output de `standalone` cambia de path.

---

## Custom domain

### Opción A: Workers Routes (recomendado)

1. Dominio ya en Cloudflare DNS
2. Dashboard → Workers & Pages → empliq-website → Triggers → Custom Domains
3. Agregar `empliq.io` y `www.empliq.io`
4. Cloudflare configura automáticamente el DNS record

### Opción B: CNAME manual

```
CNAME  empliq.io      empliq-website.workers.dev
CNAME  www.empliq.io  empliq-website.workers.dev
```

---

## Limitaciones conocidas

| Limitación | Impacto | Workaround |
|------------|---------|------------|
| **Worker size**: 10MB (free) / 25MB (paid) | Bundles grandes pueden fallar | Tree-shaking, lazy imports, excluir `three.js` de SSR |
| **CPU time**: 10ms (free) / 50ms (paid) | SSR complejo puede timeout | ISR/SSG para páginas pesadas |
| **No filesystem** | `fs.readFileSync` no funciona | Usar `fetch()` o KV/R2 |
| **Next.js Image Optimization** | `next/image` loader built-in no funciona | Usar Cloudflare Images o `unoptimized: true` |
| **Middleware** | Soportado via OpenNext pero con diferencias | Testear edge cases con `npm run preview` |
| **React Compiler** | Compatible pero verificar build output | Ya habilitado en nuestro proyecto |
| **Three.js / WebGL** | Solo client-side, no afecta Worker | ✅ Ya usamos `dynamic(() => ..., { ssr: false })` |

### Next.js Image — Configuración recomendada

```typescript
// next.config.ts — agregar si usamos Cloudflare Images
const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/cloudflare-image-loader.ts",
  },
};
```

```typescript
// src/lib/cloudflare-image-loader.ts
export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const params = [`width=${width}`, `quality=${quality || 75}`, "format=auto"];
  return `/cdn-cgi/image/${params.join(",")}/${src}`;
}
```

---

## Troubleshooting

### Error: "Worker exceeded size limit"

```bash
# Verificar tamaño del bundle
du -sh .open-next/worker.js

# Si > 10MB: activar plan Workers Paid ($5/mo) o reducir bundle
# Verificar qué pesa más:
npx wrangler deploy --dry-run --outdir=.open-next/debug
```

### Error: "Could not resolve module"

Asegurarse de que `compatibility_flags` incluya `"nodejs_compat"` en `wrangler.jsonc`.

### Error: "No such module: node:*"

OpenNext requiere `nodejs_compat`. Verificar:
```jsonc
"compatibility_flags": ["nodejs_compat"]
```

### Dev mode no funciona con OpenNext

Si `initOpenNextCloudflareForDev()` falla, usar dev normal:
```bash
# Dev normal (sin Cloudflare runtime)
npm run dev

# Dev con Cloudflare runtime
npm run preview
```

### Logs en producción

```bash
npx wrangler tail empliq-website
# Muestra logs en tiempo real del Worker
```

---

## Costos estimados

| Concepto | Free tier | Paid ($5/mo) |
|----------|-----------|--------------|
| Requests | 100K/día | 10M/mes incluido |
| CPU time | 10ms | 50ms |
| Workers size | 10MB | 25MB |
| Custom domains | ✅ | ✅ |
| KV reads | 100K/día | 10M/mes |

Para el tráfico esperado de Empliq (Perú), el **free tier** debería ser suficiente para empezar.

---

## Checklist pre-deploy

- [ ] Cuenta Cloudflare creada
- [ ] API Token generado (Workers:Edit, Workers KV:Edit)
- [ ] Account ID copiado
- [ ] `npm install --save-dev @opennextjs/cloudflare wrangler`
- [ ] `wrangler.jsonc` creado con vars correctas
- [ ] `open-next.config.ts` creado
- [ ] `next.config.ts` actualizado con `initOpenNextCloudflareForDev`
- [ ] `.dev.vars` creado (local)
- [ ] `.gitignore` actualizado (`.open-next/`, `.dev.vars`, `.wrangler/`)
- [ ] `npm run preview` funciona localmente
- [ ] `npm run deploy` exitoso
- [ ] Custom domain configurado
- [ ] GitHub Secrets configurados (para CI/CD)

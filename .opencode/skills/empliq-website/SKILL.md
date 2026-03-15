---
name: empliq-website
description: Next.js 16 website with landing page, app pages, company profiles, review and salary forms, design patterns, and Cloudflare Workers deployment
---

# Empliq Website (`apps/website/`)

Next.js landing page + app. Puerto 3000. Produccion: `empliq.io` (Cloudflare Workers via OpenNext).

## Configuracion de API

```env
NEXT_PUBLIC_API_URL=https://api.empliq.io/api    # produccion (default)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000    # auth local
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Para API local: `NEXT_PUBLIC_API_URL=http://localhost:4000/api`

## Estructura

```
src/
├── app/
│   ├── layout.tsx         # Root layout (Inter font, metadata)
│   ├── page.tsx           # Landing page (composicion de secciones)
│   ├── globals.css        # Variables CSS, animaciones
│   ├── empresas/[slug]/   # Company profile con layout compartido
│   ├── configuracion/     # Settings page
│   ├── login/             # Login page
│   ├── auth/callback/     # OAuth callback
│   ├── terminos/          # Terminos de servicio
│   └── privacidad/        # Politica de privacidad
├── components/
│   ├── Header.tsx         # Navbar sticky (h-20) con NavigationMenu
│   ├── Hero.tsx           # Headline + mockup + shader
│   ├── LogoCloud.tsx      # Marquee de empresas peruanas
│   ├── IllustrationShowcase.tsx  # Bento grid
│   ├── UseCases.tsx       # 3 casos de uso
│   ├── Features.tsx       # 6 features en grid 3x2
│   ├── Footer.tsx         # Links + copyright
│   ├── AppHeader.tsx      # Header de la app (2 barras)
│   ├── AppFooter.tsx      # Footer de la app
│   ├── ReviewForm.tsx     # Formulario colapsable de resenas
│   ├── ReviewList.tsx     # Lista de resenas estilo YouTube
│   ├── SalaryForm.tsx     # Formulario colapsable de salarios
│   ├── BenefitForm.tsx    # Formulario colapsable de beneficios
│   ├── ScrollableTabs.tsx # Tabs horizontales con flechas
│   ├── Shader3.tsx        # WebGL shader background
│   └── ui/                # shadcn/ui components
└── lib/
    ├── supabase/client.ts # Browser client
    ├── supabase/server.ts # Server client
    └── utils.ts           # cn() utility
```

## Rutas de la App

```
/                           -> Landing page
/login                      -> Login (Google OAuth)
/auth/callback              -> OAuth callback
/empresas                   -> Listado de empresas
/empresas/[slug]            -> Company overview
/empresas/[slug]/salarios   -> Salarios
/empresas/[slug]/resenas    -> Resenas
/empresas/[slug]/beneficios -> Beneficios
/configuracion              -> Settings page (6 secciones)
/terminos                   -> Terminos de servicio
/privacidad                 -> Politica de privacidad
```

## Company Profile Layout

- `layout.tsx` client component con `CompanyProvider` (React Context)
- Tabs por URL usando `ScrollableTabs` con flechas de navegacion en mobile
- Cada sub-pagina tiene `generateMetadata()` para SEO
- Header: back arrow, logo, nombre, meta (industria, ubicacion, empleados, fundacion, web, rating)

## Patron de formularios colapsables

ReviewForm, SalaryForm y BenefitForm siguen el mismo patron:
1. **Colapsado**: prompt clickeable en card
2. **Expandido**: formulario completo con validacion
3. **Enviado**: mensaje de exito, auto-colapsa en 3s

ReviewForm usa react-hook-form + zod. SalaryForm tiene combobox con fuzzy matching para puestos.

## Identidad visual

- **Monocromatico:** negro, blanco, plata (neutral-900/600/400)
- **Color con proposito:** Solo para indicadores de impacto (text-green-600)
- **Shader:** Three.js con color #808080 (gris)
- **Glassmorphism** en header: bg-black/60 backdrop-blur-xl

## Skeleton loading

Cada seccion que carga datos tiene su propio skeleton anatomico que replica la estructura visual del contenido real. No usar spinners genericos.

## Deploy

Cloudflare Workers via OpenNext.
- Repo: `empliq-website`
- Workflow: `.github/workflows/deploy.yml`
- Secrets: `CF_WORKERS_API_TOKEN`, `CF_WORKERS_ACCOUNT_ID`
- Manual: `cd apps/website && npm run deploy`

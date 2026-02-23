# App: Website (`apps/website/`)

> Next.js landing page. Puerto: 3000.

## Resumen

Landing page pública de Empliq. Diseño monocromático con micro-dosis de color. Usa Three.js para shader de fondo y Framer Motion para animaciones.

## Estructura

```
src/
├── app/
│   ├── layout.tsx         # Root layout (Inter font, metadata)
│   ├── page.tsx           # Landing page (composición de secciones)
│   ├── globals.css        # Variables CSS, animaciones
│   └── test-avatars/      # Página de test (dev only)
├── components/
│   ├── Header.tsx         # Navbar sticky (h-20) con NavigationMenu
│   ├── Hero.tsx           # Headline + mockup dashboard + shader
│   ├── LogoCloud.tsx      # Marquee de empresas peruanas
│   ├── IllustrationShowcase.tsx  # Bento grid con ilustraciones
│   ├── UseCases.tsx       # 3 casos de uso (accordion style)
│   ├── Features.tsx       # 6 features en grid 3x2
│   ├── Testimonials.tsx   # Testimonios (deshabilitado)
│   ├── CTA.tsx            # Call to action (deshabilitado)
│   ├── Footer.tsx         # Links + copyright
│   ├── CookieConsent.tsx  # Banner de cookies
│   ├── EmpliqLogo.tsx     # Logo SVG
│   ├── Shader3.tsx        # WebGL shader background
│   └── ui/
│       └── navigation-menu.tsx  # Radix NavigationMenu
└── lib/
    └── utils.ts           # cn() utility
```

## Composición de la Landing (page.tsx)

```
Header (sticky, h-20, z-50)
├── Hero (flex-1, shader background)
├── LogoCloud (marquee, border-y)
│   ↑ Ambos dentro de un wrapper h-[calc(100vh-5rem)]
├── IllustrationShowcase (bento grid)
├── UseCases (3 cards con accordion)
├── Features (6 cards en grid)
├── [Testimonials] (deshabilitado)
├── [CTA] (deshabilitado)
Footer
CookieBanner
```

## Identidad Visual

- **Monocromático:** negro, blanco, plata (`neutral-900/600/400`)
- **Color con propósito:** Solo para indicadores de impacto (`text-green-600` en stats)
- **Gradientes de hover:** Cada feature card tiene su gradiente propio (se mantienen)
- **Shader:** Three.js con color `#808080` (gris)
- Ver [ADR-005](../decisions/005-monochromatic-design.md)

## Assets

```
public/illustrations/
├── avatars/     # 24 PNG transpararentes (split de grids)
└── work/        # 12 PNG transparentes (work_office_team, work_collaboration, etc.)
```

## Pendiente

- [ ] SEO meta tags (title, description, og:image)
- [ ] Analytics (posthog o similar)
- [ ] Habilitar Testimonials cuando haya datos reales
- [ ] Habilitar CTA cuando haya más datos

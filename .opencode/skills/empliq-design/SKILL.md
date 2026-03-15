---
name: empliq-design
description: Design system with dark mode tokens, typography scale, component patterns, animations, spacing guidelines, and UI patterns for cards, forms, tables, and layouts
---

# Empliq Design System

Guia de estilo visual. Modo oscuro primario. Monocromatico con micro-dosis de color.

## Filosofia

1. **Claridad ante todo** — informacion facil de escanear
2. **Densidad controlada** — balance contenido/espacio en blanco
3. **Profundidad sutil** — sombras y capas para jerarquia
4. **Movimiento con proposito** — animaciones que guian, no distraen

Inspiracion: Payload CMS (dark mode), Warp Terminal (glassmorphism), Linear (micro-interacciones).

## Paleta de colores (Dark Mode)

```css
/* Backgrounds */
--bg-base:        #000000;
--bg-elevated:    #0a0a0a;     /* Cards, modales */
--bg-surface:     #111111;     /* Inputs */
--bg-hover:       #1a1a1a;

/* Borders */
--border-subtle:  rgba(255, 255, 255, 0.06);
--border-default: rgba(255, 255, 255, 0.10);
--border-strong:  rgba(255, 255, 255, 0.15);

/* Text */
--text-primary:   #ffffff;
--text-secondary: #a3a3a3;     /* Neutral 400 */
--text-muted:     #737373;     /* Neutral 500 */

/* Brand: blanco */
--primary:        #ffffff;

/* Status */
--success:        #22c55e;     /* Green 500 */
--warning:        #f59e0b;     /* Amber 500 */
--error:          #ef4444;     /* Red 500 */
```

## Tipografia

- **Sans:** Inter, system stack
- **Mono:** JetBrains Mono, Fira Code

| Nombre | Tamano | Weight | Uso |
|--------|--------|--------|-----|
| display | 48px / 3rem | 600 | Hero headlines |
| h1 | 36px / 2.25rem | 600 | Titulos de pagina |
| h2 | 28px / 1.75rem | 600 | Titulos de seccion |
| h3 | 22px / 1.375rem | 600 | Subtitulos |
| body | 16px / 1rem | 400 | Texto principal |
| body-sm | 14px / 0.875rem | 400 | Texto secundario |
| caption | 12px / 0.75rem | 400 | Labels, metadata |

## Componentes principales

### Botones
- **Primary:** `bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200`
- **Secondary:** `bg-transparent text-white border border-white/10 hover:bg-white/5`
- **Ghost:** `text-neutral-400 hover:text-white hover:bg-white/5`

### Cards
- **Base:** `bg-neutral-900/50 border border-white/[0.06] rounded-xl p-6 backdrop-blur-sm`
- **Elevada:** agrega `hover:border-white/[0.12] hover:bg-neutral-900/70 -translate-y-0.5`

### Inputs
- `bg-neutral-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm placeholder:text-neutral-500`
- Focus: `focus:border-white/20 focus:ring-1 focus:ring-white/10`

### Badges
- Default: `bg-white/10 text-neutral-300`
- Success: `bg-green-500/10 text-green-400`
- Warning: `bg-amber-500/10 text-amber-400`
- Error: `bg-red-500/10 text-red-400`

### Tables
- Header: `border-b border-white/[0.06] text-neutral-500 font-medium`
- Row: `border-b border-white/[0.06] hover:bg-white/[0.02]`

## Efectos

- **Transiciones:** `transition-all duration-200 ease-out` (interactivos), `duration-300` (layout)
- **Glassmorphism:** `bg-black/60 backdrop-blur-xl border border-white/[0.06]` (usado en Header)
- **Gradient text:** `bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-transparent`
- **Glow:** `box-shadow: 0 0 40px rgba(255, 255, 255, 0.1)`

## Iconografia

Lucide React, 1.5px stroke.
- Inline: `w-4 h-4`
- Botones: `w-[18px] h-[18px]`
- Cards: `w-6 h-6`
- Hero: `w-12 h-12`

## Espaciado

Base 4px. Cards: `p-6`. Listas: `gap-4`. Secciones: `my-16`. Botones: `px-4 py-2`.

## Patrones UI

### Dashboard Layout
Sidebar fija `w-64 border-r` + main con header sticky `h-16 backdrop-blur-xl` + content `p-8`.

### Skeleton Loading
Cada seccion tiene skeleton anatomico. Circular para avatares, rectangulos para texto. Mismo layout que contenido final. NO spinners genericos.

### Formularios colapsables
Patron compartido: collapsed prompt -> expanded form -> success message (auto-colapsa 3s).

### Labels
`text-xs font-medium text-muted-foreground uppercase tracking-wider`

### Overflow (Mobile)
`overflow-x-hidden` en html/body. Cards: `overflow-hidden`. Textos: `truncate`, `line-clamp-2`.

## Responsive

Mobile-first. Breakpoints TailwindCSS defaults: sm(640), md(768), lg(1024), xl(1280).
Contenedor app: `max-w-7xl mx-auto px-4 sm:px-6`.

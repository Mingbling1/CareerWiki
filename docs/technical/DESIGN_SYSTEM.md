# Empliq - Sistema de Diseño

> Guía de estilo visual para mantener consistencia entre el website y la aplicación frontend.

##  Índice

1. [Filosofía de Diseño](#filosofía-de-diseño)
2. [Paleta de Colores](#paleta-de-colores)
3. [Tipografía](#tipografía)
4. [Espaciado](#espaciado)
5. [Componentes](#componentes)
6. [Efectos y Animaciones](#efectos-y-animaciones)
7. [Iconografía](#iconografía)
8. [Patrones de UI](#patrones-de-ui)

---

## Filosofía de Diseño

### Principios

1. **Claridad ante todo** - La información debe ser fácil de escanear y entender
2. **Densidad controlada** - Balance entre contenido y espacio en blanco
3. **Profundidad sutil** - Uso de sombras y capas para jerarquía visual
4. **Movimiento con propósito** - Animaciones que guían, no distraen

### Inspiración Visual

Nuestra estética toma elementos de:
- **Payload CMS** - Dark mode sofisticado, bordes sutiles, tipografía clean
- **Warp Terminal** - Transparencias, efectos glassmorphism
- **Linear** - Micro-interacciones, gradientes sutiles

---

## Paleta de Colores

### Modo Oscuro (Primario)

```css
/* Background Layers */
--bg-base:        #000000;     /* Fondo principal */
--bg-elevated:    #0a0a0a;     /* Cards, modales */
--bg-surface:     #111111;     /* Inputs, selects */
--bg-hover:       #1a1a1a;     /* Estados hover */

/* Borders */
--border-subtle:  rgba(255, 255, 255, 0.06);
--border-default: rgba(255, 255, 255, 0.10);
--border-strong:  rgba(255, 255, 255, 0.15);

/* Text */
--text-primary:   #ffffff;
--text-secondary: #a3a3a3;     /* Neutral 400 */
--text-muted:     #737373;     /* Neutral 500 */
--text-subtle:    #525252;     /* Neutral 600 */

/* Brand Colors */
--primary:        #ffffff;     /* Botones principales - blanco */
--primary-hover:  #e5e5e5;

/* Accent (para highlights) */
--accent:         #3b82f6;     /* Blue 500 */
--accent-hover:   #2563eb;     /* Blue 600 */
--accent-muted:   rgba(59, 130, 246, 0.15);

/* Status Colors */
--success:        #22c55e;     /* Green 500 */
--warning:        #f59e0b;     /* Amber 500 */
--error:          #ef4444;     /* Red 500 */
--info:           #3b82f6;     /* Blue 500 */
```

### Tokens en TailwindCSS

```javascript
// tailwind.config.js
colors: {
  background: {
    DEFAULT: '#000000',
    elevated: '#0a0a0a',
    surface: '#111111',
    hover: '#1a1a1a',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    DEFAULT: 'rgba(255, 255, 255, 0.10)',
    strong: 'rgba(255, 255, 255, 0.15)',
  },
  // ...
}
```

---

## Tipografía

### Font Family

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Escala Tipográfica

| Nombre | Tamaño | Line Height | Weight | Uso |
|--------|--------|-------------|--------|-----|
| `display` | 48px / 3rem | 1.1 | 600 | Hero headlines |
| `h1` | 36px / 2.25rem | 1.2 | 600 | Títulos de página |
| `h2` | 28px / 1.75rem | 1.25 | 600 | Títulos de sección |
| `h3` | 22px / 1.375rem | 1.3 | 600 | Subtítulos |
| `h4` | 18px / 1.125rem | 1.4 | 600 | Card headers |
| `body` | 16px / 1rem | 1.6 | 400 | Texto principal |
| `body-sm` | 14px / 0.875rem | 1.5 | 400 | Texto secundario |
| `caption` | 12px / 0.75rem | 1.5 | 400 | Labels, metadata |
| `mono` | 14px / 0.875rem | 1.5 | 400 | Código, datos |

### Clases de Texto

```html
<!-- Headlines -->
<h1 class="text-4xl font-semibold tracking-tight text-white">
<h2 class="text-2xl font-semibold tracking-tight text-white">
<h3 class="text-xl font-semibold text-white">

<!-- Body -->
<p class="text-base text-neutral-400 leading-relaxed">
<p class="text-sm text-neutral-500">

<!-- Labels -->
<span class="text-xs uppercase tracking-wider text-neutral-500 font-medium">
```

---

## Espaciado

### Escala Base (4px)

```css
--space-1:  4px;   /* 0.25rem */
--space-2:  8px;   /* 0.5rem */
--space-3:  12px;  /* 0.75rem */
--space-4:  16px;  /* 1rem */
--space-5:  20px;  /* 1.25rem */
--space-6:  24px;  /* 1.5rem */
--space-8:  32px;  /* 2rem */
--space-10: 40px;  /* 2.5rem */
--space-12: 48px;  /* 3rem */
--space-16: 64px;  /* 4rem */
--space-20: 80px;  /* 5rem */
```

### Spacing Guidelines

| Contexto | Espaciado |
|----------|-----------|
| Padding interno de cards | `p-6` (24px) |
| Gap entre elementos de lista | `gap-4` (16px) |
| Margin entre secciones | `my-16` (64px) |
| Padding de botones | `px-4 py-2` |
| Padding de inputs | `px-3 py-2` |

---

## Componentes

### Botones

#### Primary Button (CTA)
```html
<button class="
  bg-white text-black
  px-4 py-2.5
  rounded-lg
  text-sm font-medium
  transition-all duration-200
  hover:bg-neutral-200
  focus:outline-none focus:ring-2 focus:ring-white/20
">
  Empezar ahora
</button>
```

#### Secondary Button
```html
<button class="
  bg-transparent text-white
  px-4 py-2.5
  rounded-lg
  text-sm font-medium
  border border-white/10
  transition-all duration-200
  hover:bg-white/5 hover:border-white/20
">
  Más información
</button>
```

#### Ghost Button
```html
<button class="
  text-neutral-400
  px-4 py-2.5
  rounded-lg
  text-sm font-medium
  transition-all duration-200
  hover:text-white hover:bg-white/5
">
  Cancelar
</button>
```

### Cards

#### Card Base
```html
<div class="
  bg-neutral-900/50
  border border-white/[0.06]
  rounded-xl
  p-6
  backdrop-blur-sm
">
  <!-- Content -->
</div>
```

#### Card Elevada (con hover)
```html
<div class="
  bg-neutral-900/50
  border border-white/[0.06]
  rounded-xl
  p-6
  transition-all duration-300
  hover:border-white/[0.12]
  hover:bg-neutral-900/70
  group
">
  <!-- Content -->
</div>
```

### Inputs

#### Text Input
```html
<input 
  type="text"
  class="
    w-full
    bg-neutral-900
    border border-white/10
    rounded-lg
    px-3 py-2.5
    text-sm text-white
    placeholder:text-neutral-500
    transition-colors duration-200
    focus:outline-none
    focus:border-white/20
    focus:ring-1 focus:ring-white/10
  "
  placeholder="Escribe aquí..."
/>
```

#### Select
```html
<select class="
  w-full
  bg-neutral-900
  border border-white/10
  rounded-lg
  px-3 py-2.5
  text-sm text-white
  transition-colors duration-200
  focus:outline-none
  focus:border-white/20
">
  <option>Opción 1</option>
</select>
```

### Badges

```html
<!-- Default -->
<span class="px-2 py-1 text-xs font-medium bg-white/10 text-neutral-300 rounded">
  Default
</span>

<!-- Success -->
<span class="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-400 rounded">
  Activo
</span>

<!-- Warning -->
<span class="px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 rounded">
  Pendiente
</span>

<!-- Error -->
<span class="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 rounded">
  Error
</span>
```

### Tables

```html
<table class="w-full text-sm">
  <thead>
    <tr class="border-b border-white/[0.06]">
      <th class="text-left py-3 px-4 text-neutral-500 font-medium">Nombre</th>
      <th class="text-left py-3 px-4 text-neutral-500 font-medium">Puesto</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
      <td class="py-3 px-4 text-white">Juan Pérez</td>
      <td class="py-3 px-4 text-neutral-400">Desarrollador</td>
    </tr>
  </tbody>
</table>
```

---

## Efectos y Animaciones

### Transiciones Base

```css
/* Todos los elementos interactivos */
transition-all duration-200 ease-out

/* Para cambios de layout */
transition-all duration-300 ease-out

/* Para modales/overlays */
transition-opacity duration-200 ease-out
```

### Efectos de Hover

```css
/* Card hover - elevación sutil */
.card {
  @apply transition-all duration-300;
}
.card:hover {
  @apply border-white/[0.12] bg-neutral-900/70 -translate-y-0.5;
}

/* Link hover - underline animado */
.link {
  @apply relative;
}
.link::after {
  @apply absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-300;
  content: '';
}
.link:hover::after {
  @apply w-full;
}
```

### Glassmorphism (usado en Header)

```css
.glass {
  @apply bg-black/60 backdrop-blur-xl border border-white/[0.06];
}
```

### Gradientes

```css
/* Gradiente texto hero */
.gradient-text {
  @apply bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-transparent;
}

/* Glow effect para CTAs importantes */
.glow {
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.1);
}
```

---

## Iconografía

### Librería Recomendada
- **Lucide React** - Consistente, personalizable, 1.5px stroke

### Tamaños

| Contexto | Tamaño | Clase |
|----------|--------|-------|
| Inline con texto | 16px | `w-4 h-4` |
| Botones | 18px | `w-[18px] h-[18px]` |
| Cards/Features | 24px | `w-6 h-6` |
| Hero/Empty states | 48px | `w-12 h-12` |

### Estilo

```html
<!-- Icon con color heredado -->
<ChevronRight class="w-4 h-4 text-neutral-500" />

<!-- Icon en botón -->
<button class="inline-flex items-center gap-2">
  <span>Continuar</span>
  <ArrowRight class="w-4 h-4" />
</button>
```

---

## Patrones de UI

### Layout de Dashboard

```html
<div class="min-h-screen bg-black">
  <!-- Sidebar -->
  <aside class="fixed left-0 top-0 h-screen w-64 border-r border-white/[0.06] bg-black">
    <!-- Nav items -->
  </aside>
  
  <!-- Main content -->
  <main class="ml-64">
    <!-- Header -->
    <header class="sticky top-0 h-16 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
      <!-- Breadcrumbs, actions -->
    </header>
    
    <!-- Content -->
    <div class="p-8">
      <!-- Page content -->
    </div>
  </main>
</div>
```

### Empty States

```html
<div class="flex flex-col items-center justify-center py-16 text-center">
  <div class="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
    <FolderOpen class="w-6 h-6 text-neutral-500" />
  </div>
  <h3 class="text-lg font-medium text-white mb-1">No hay datos</h3>
  <p class="text-sm text-neutral-500 mb-4">Comienza agregando tu primer elemento.</p>
  <button class="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium">
    Agregar elemento
  </button>
</div>
```

### Loading States

```html
<!-- Skeleton -->
<div class="animate-pulse">
  <div class="h-4 bg-neutral-800 rounded w-3/4 mb-2"></div>
  <div class="h-4 bg-neutral-800 rounded w-1/2"></div>
</div>

<!-- Spinner -->
<div class="w-5 h-5 border-2 border-neutral-700 border-t-white rounded-full animate-spin"></div>
```

---

## Responsive Breakpoints

```javascript
// TailwindCSS defaults
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablets
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

### Mobile-first approach

```html
<!-- Ejemplo: grid que cambia columnas -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>
```

---

## Recursos

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons)
- [Inter Font](https://rsms.me/inter/)
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/)

---

## Patrones de App (website)

### App Header (dos barras)

Componente: `AppHeader.tsx`

```
+--[Logo]-----[Search]-----[S/ PEN 🇵🇪]--[Bell]--[Avatar]--+  <- barra primaria
+--[Salarios]--[Empresas]-----------------------------------+  <- barra secundaria
```

- Barra primaria: logo, busqueda global (oculta en mobile con toggle), selector moneda/idioma (solo `md+`), notificaciones, avatar/login
- Barra secundaria: tabs de navegacion siempre visibles (mobile y desktop)
- Sticky `top-0 z-50` con `backdrop-blur`
- Mobile: busqueda se expande debajo al tocar icono lupa. Sin hamburger menu.
- Contenedor: `max-w-7xl mx-auto px-4 sm:px-6`

### Currency / Language Selector

Componente: `CurrencyLanguageSelector.tsx`

- Display estatico (sin interaccion): `S/. PEN / mes` y bandera `🇵🇪`
- Solo PEN (Sol Peruano) y Español (Peru) — unica moneda e idioma activo
- Solo visible en desktop (`hidden md:flex`)
- Dos `<span>` con separador `/` y estilos `text-sm text-muted-foreground`

### App Footer

Componente: `AppFooter.tsx`

- Cuatro columnas: Logo+tagline | Empliq | Contribuir | Legal
- Mobile: grid `grid-cols-2`, desktop: `md:grid-cols-4`
- Fondo: `bg-muted/30 border-t border-border/40`
- Copyright + iconos sociales (GitHub, Twitter) en fila inferior

### User Dropdown Menu

- Ancho: `w-56`
- Dos secciones separadas por `border-t border-border/60`:
  1. **Info**: nombre + email
  2. **Configuracion**: link a `/configuracion`
  3. **Cerrar sesion** (texto `text-destructive`)
- Items: `px-4 py-2.5 text-sm` con iconos Lucide `h-4 w-4`
- Backdrop: overlay invisible `fixed inset-0 z-40` para cerrar al hacer click fuera
- Configuracion es `<Link>` que navega a la pagina completa de settings

### Settings Page (Configuracion)

Ruta: `/configuracion` — Componente: `settings-page.tsx`

- Layout: sidebar izquierda (`md:w-56`) + panel de contenido derecha
- Boton "Volver" con `ArrowLeft` que usa `router.back()`
- 6 secciones via tabs internos (estado local, sin cambiar URL):
  1. **Perfil**: avatar (Google sync), nombre, email, cargo, empresa
  2. **Notificaciones**: toggles para email, alertas de salarios/resenas, digest semanal
  3. **Privacidad**: toggles para perfil publico, mostrar salario, mostrar empresa + zona de peligro (eliminar cuenta)
  4. **Apariencia**: selector de tema (claro/oscuro/sistema con cards), idioma, moneda
  5. **Plan**: card con plan actual (gratuito), limites de uso
  6. **Ayuda**: links a FAQ, centro de ayuda, reportar problema, contacto
- Toggle custom: `h-5 w-9` con animacion de desplazamiento
- Contenido envuelto en card: `rounded-xl border border-border/40 bg-card p-6 sm:p-8`
- Todas las acciones marcadas como "proximamente" (UI scaffolding)

### Scrollable Tabs (con flechas)

Componente: `ScrollableTabs.tsx`

- Tabs horizontales con scroll automatico y flechas de navegacion
- Flechas circulares (`w-7 h-7 rounded-full`) aparecen solo cuando hay overflow
- Flecha izquierda se oculta cuando esta al inicio, derecha al final
- `scrollbar-none` para ocultar scrollbar nativo
- Al montar, hace scroll automatico al tab activo: `scrollIntoView({ inline: "center" })`
- Scroll suave al presionar flechas: `scrollBy({ behavior: "smooth" })`
- Usado en company profile tabs (Resumen, Salarios, Resenas, Beneficios)
- Escalable: soporta N tabs sin romper el layout

### Company Profile Layout (SEO)

Rutas con layout compartido:

```
/empresas/[slug]            -> Resumen (CompanyOverview)
/empresas/[slug]/salarios   -> Salarios (CompanySalarios)
/empresas/[slug]/resenas    -> Resenas (CompanyResenas)
/empresas/[slug]/beneficios -> Beneficios (CompanyBeneficios)
```

- `layout.tsx` client component con `CompanyProvider` (React Context para datos compartidos)
- Tabs por URL usando `ScrollableTabs` con flechas de navegacion en mobile
- Cada sub-pagina tiene `generateMetadata()` para SEO
- Header de empresa: back arrow, logo, nombre, meta (industria, ubicacion, empleados, fundacion, web, rating)
- Tab activo: `after:h-[2px] after:bg-foreground after:rounded-full`

### Company Cards (responsive)

Componente: `company-list.tsx`

- Card: `rounded-xl border border-border/40 bg-card p-5 overflow-hidden`
- Layout interno: `flex items-start gap-3 min-w-0` para contener texto
- Nombre y industria: `truncate` para evitar overflow
- Descripcion: `line-clamp-2 break-words` para cortar texto largo
- Stats (ubicacion, empleados): `min-w-0 truncate` en contenedor y `shrink-0` en iconos
- Grid responsive: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`

### Login Page

- Grid `lg:grid-cols-2`: formulario izquierda, panel decorativo derecha
- Panel derecho: ilustracion de fondo (opacity 7%), quote, avatar real
- Ilustraciones: `/public/illustrations/work/` (12 variantes)
- Avatares: `/public/avatars/` (12 variantes)
- Solo Google OAuth, boton full-width `h-11`

### Logo Carousel (Landing)

- Marquee CSS puro: `translateX(-33.333%)` con 3x duplicacion de logos
- Velocidad: `35s linear infinite`
- Gradient masks en bordes para fade-in/fade-out
- Logos en grayscale con hover a color

### Overflow Prevention (Mobile)

```css
html { overflow-x: hidden; }
body { overflow-x: hidden; }
```

- Layout root: `overflow-x-hidden` en el contenedor principal
- Cards: `overflow-hidden` para contener contenido
- Textos largos: `truncate`, `line-clamp-2`, `break-words`
- Tabs: `ScrollableTabs` con flechas en lugar de scroll libre

### Review System

#### ReviewForm (`ReviewForm.tsx`)

Formulario colapsable estilo YouTube para enviar reseñas.

**Stack:** react-hook-form + zod + @hookform/resolvers/zod

**Dependencias npm (website workspace):**
```
react-hook-form: ^7.71.2
@hookform/resolvers: ^5.2.2
zod: ^4.3.6
```

> **Nota monorepo:** Estas dependencias se hoistan al root `node_modules/`. Si
> Turbopack dev no las resuelve, ejecutar `npm install @hookform/resolvers --workspace=apps/website`.

**Schema Zod:**
```ts
z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(120),
  comment: z.string().min(20).max(2000),
  jobTitle: z.string().min(2).max(100),
  isCurrentEmployee: z.boolean(),
})
```

**Estados del componente:**
1. **Colapsado** — Prompt clickeable: `rounded-xl border border-border/40 bg-card hover:bg-muted/30 p-5`
2. **Expandido** — Formulario completo con campos
3. **Enviado** — Mensaje de confirmacion con icono estrella, se auto-colapsa en 3s

**Subcomponente StarRating:**
- 5 estrellas clickeables con hover state y labels (Muy mal → Excelente)
- Estrella activa: `fill-foreground text-foreground`
- Estrella inactiva: `text-muted-foreground/25`
- Animacion: `hover:scale-110`

**Campos del formulario:**
- Rating (StarRating customizado)
- Cargo + Estado (grid 2 columnas en `sm+`)
- Titulo de resena (Input)
- Comentario (Textarea `min-h-[120px]` con contador `{n}/2000`)

**Labels:** `text-xs font-medium text-muted-foreground uppercase tracking-wider`
**Inputs:** `bg-muted/30 border-border/60 h-9 text-sm`
**Submit bar:** `bg-muted/20 border-t border-border/40` con texto anonimato + boton

#### ReviewList (`ReviewList.tsx`)

Lista de resenas estilo YouTube con paginacion "Mostrar mas".

**Estructura de ReviewCard:**
- Avatar circular (`h-9 w-9 rounded-full`) con iniciales
- Header: nombre anonimo, badge (con/sin empleo actual), estrellitas, tiempo relativo
- Cargo: `text-xs text-muted-foreground`
- Comentario: texto libre
- Footer: boton "Util" con toggle + "Reportar" dropdown

**Star Rating display (inline):**
- Estrellas small `h-3.5 w-3.5`
- Activa: `fill-foreground text-foreground`
- Inactiva: `text-muted-foreground/20`

**Paginacion:** `REVIEWS_PER_PAGE = 10`, boton "Mostrar mas resenas" con `ChevronDown`

**Loading skeleton (anatomico):**
```tsx
<Skeleton className="h-9 w-9 rounded-full" />  // Avatar
<Skeleton className="h-4 w-20" />               // Nombre
<Skeleton className="h-3.5 w-24" />             // Cargo
<Skeleton className="h-3 w-full" />             // Texto linea 1
<Skeleton className="h-3 w-4/5" />              // Texto linea 2
<Skeleton className="h-3 w-2/3" />              // Texto linea 3
```

### Skeleton Loading (patron general)

Componente base: `@/components/ui/skeleton` (shadcn)

**Regla:** Cada seccion que carga datos tiene su propio skeleton anatomico que replica
la estructura visual del contenido real. No usar spinners genericos (Loader2).

**Patrones:**
- Circular (avatares): `rounded-full`
- Rectangulos (texto): `h-3` a `h-7` con anchos variables (`w-20`, `w-full`, `w-4/5`)
- Linea separadora: `h-px w-full`
- Cards: mismo `rounded-xl border` que la card real
- Replicar el grid/layout exacto del contenido final

**Implementaciones:**
- Company layout: header skeleton + tabs
- Company list: card skeleton con avatar + lineas
- Settings page: sidebar nav + content area
- ReviewList: avatar + nombre/cargo + lineas de texto

### Paginas Legales

Rutas: `/terminos` y `/privacidad`

**Layout comun:**
- Contenedor: `max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16`
- Titulo: `text-3xl sm:text-4xl font-bold`
- Fecha: `text-sm text-muted-foreground`
- Secciones: `<h2>` numeradas con clases `text-xl sm:text-2xl font-semibold`
- Parrafos: `text-muted-foreground leading-relaxed`
- Listas: `list-disc list-inside space-y-1`
- Footer link: "Volver al inicio" → `/`

**Contenido:**
- Terminos de servicio: 11 secciones, ley peruana
- Politica de privacidad: 14 secciones, Ley 29733 (LPDP), derechos ARCO, ANPDP
- Emails de contacto: `legal@empliq.io`, `privacidad@empliq.io`

**Links en footers:** "Terminos de servicio" → `/terminos`, "Politica de privacidad" → `/privacidad`
(estandarizado en `AppFooter.tsx` y `Footer.tsx`)

### SalaryForm (formulario de salario)

Componente: `@/components/SalaryForm.tsx`

**Patron:** Collapsible form (igual que ReviewForm)
- Collapsed: prompt "¿Trabajas en {companyName}? Reporta tu salario de forma anonima..."
- Expanded: formulario completo
- Submitted: mensaje de exito con icono DollarSign

**Campos:**
- **Puesto/Cargo** (autocomplete inteligente):
  - Combobox custom con fuzzy matching
  - Prioriza posiciones existentes en la empresa (boost +10 puntos)
  - 80+ puestos curados del mercado peruano, agrupados por categoria
  - Tolerancia a typos via distancia de Levenshtein (dist <= 2)
  - Normaliza acentos (`normalize("NFD")`) para comparar
  - Dropdown: `border-border/40 bg-card shadow-lg`, items `hover:bg-muted/50`
  - Posiciones existentes muestran "Ya existe en esta empresa" en `text-[10px]`
- **Nivel**: chips toggle (Practicante/Junior/Mid/Senior/Lead/Gerente/Director)
  - Activo: `bg-foreground text-background border-foreground`
  - Inactivo: `bg-muted/30 text-muted-foreground border-border/60`
- **Salario bruto**: input numerico con prefijo "S/"
- **Periodo**: toggle buttons (Mensual/Anual)
- **Anos de experiencia**: input numerico (0-50)

**API flow:**
1. Fuzzy match titulo contra posiciones existentes (via `normalize()`)
2. Si match exacto → usa positionId existente
3. Si nuevo → `api.positions.create({companyId, title, level})`
4. Luego → `api.salaries.add(positionId, {amount, currency, period, yearsExperience})`

**Integracion:** `company-salarios.tsx` → `<SalaryForm>` arriba de la tabla de salarios

### BenefitForm (formulario de beneficios)

Componente: `@/components/BenefitForm.tsx`

**Patron:** Collapsible form (igual que ReviewForm)
- Collapsed: prompt "¿Conoces los beneficios de {companyName}? Comparte la informacion..."
- Expanded: formulario com categorias visuales
- Submitted: mensaje de exito con icono Heart

**Categorias** (7, inspiradas en levels.fyi):
| Categoria | Icono | Beneficios ejemplo |
|---|---|---|
| Salud y Seguro | Shield | EPS, dental, vida, oncologico, salud mental |
| Financiero y Retiro | Wallet | Bono anual, utilidades, AFP complementaria |
| Tiempo Libre | Clock | Vacaciones extra, cumpleanos, home office |
| Familia | Baby | Licencia maternal/paternal, guarderia, bono escolar |
| Desarrollo Profesional | GraduationCap | Capacitaciones, certificaciones, maestria |
| Alimentacion y Transporte | Bus | Vales de alimentos, movilidad, estacionamiento |
| Perks y Bienestar | Gift | Gimnasio, descuentos, happy hours, team building |

**Campos:**
- **Categoria**: grid 2x4 de botones con iconos (seleccion unica)
  - Activo: `bg-foreground text-background border-foreground`
  - Inactivo: `bg-muted/30 text-muted-foreground border-border/60`
  - Label: `text-[10px] font-medium`
- **Beneficio** (autocomplete): combobox filtrado por categoria seleccionada
  - Muestra 6 sugerencias maximas
  - Fuzzy matching por palabras
  - Permite texto libre si no hay match
- **Descripcion** (opcional): textarea `min-h-20`

**API:** `api.benefits.add({companyId, name, category, description})`

**Integracion:** `company-beneficios.tsx` → `<BenefitForm>` arriba de la lista de beneficios


# Empliq - Sistema de Diseño

> Guía de estilo visual para mantener consistencia entre el website y la aplicación frontend.

## 📋 Índice

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

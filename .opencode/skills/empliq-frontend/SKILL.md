---
name: empliq-frontend
description: React Vite dashboard SPA with ReactFlow organigramas, shadcn/ui components, auth contexts, and company pages
---

# Empliq Frontend (`apps/frontend/`)

React + Vite dashboard SPA. Puerto 5173. Aplicacion principal para usuarios autenticados.

**Nota:** Este frontend legacy esta siendo migrado/integrado dentro del website Next.js (`apps/website/`). La mayoria de features nuevas se desarrollan en el website.

## Estructura

```
src/
├── pages/                 # 4 paginas
├── contexts/              # 2 contextos (Auth, Theme)
├── hooks/                 # 1 hook (useIsInView)
├── components/
│   ├── auth/              # ProtectedRoute, LoginForm
│   ├── layout/            # DashboardLayout (sidebar + topbar)
│   ├── organigrama/       # 10 componentes ReactFlow
│   ├── ui/                # 14 primitivos shadcn/ui
│   └── animate-ui/        # 6 componentes animados
├── lib/                   # api.ts, auth-client.ts, utils.ts, collaborative-store.ts
└── types/                 # organigrama.ts
```

## Paginas

| Pagina | Ruta | Descripcion |
|--------|------|-------------|
| CompaniesPage | `/empresas` | Listado y busqueda de empresas |
| CompanyPage | `/empresa/:slug` | Detalle (resumen, organigrama, puestos) |
| LoginPage | `/login` | Login con email o Google |
| AuthCallback | `/auth/callback` | Callback de OAuth |

## Componentes de Organigrama (ReactFlow)

| Componente | Uso |
|------------|-----|
| `Organigrama` | Canvas principal — recibe `companyId`, renderiza nodos y edges |
| `OrgChartNode` | Nodo personalizado — titulo, cargo, departamento |
| `AddNodeDialog` | Modal — crear nuevo nodo |
| `EditNodeDialog` | Modal — editar nodo existente |
| `NodeEditPanel` | Panel lateral — edicion inline |
| `Toolbar` | Barra superior — zoom, fit, export |
| `StatsFooter` | Footer — contadores (nodos, edges, profundidad) |
| `CustomControls` | Controles personalizados de zoom |
| `layout.ts` | Algoritmo de layout jerarquico |

## Dependencias clave

- `@xyflow/react` — ReactFlow para organigramas
- `framer-motion` — Animaciones
- `tailwindcss` + `shadcn/ui` — Sistema de diseno

## Pendiente

- Vista detalle de puesto (`/empresa/:slug/puesto/:id`)
- Formulario de reportar salario
- Formulario de agregar comentario
- Navegacion organigrama -> puesto (click en nodo)
- Conectar organigrama con API real
- Modo edicion colaborativo

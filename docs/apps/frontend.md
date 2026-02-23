# App: Frontend (`apps/frontend/`)

> React + Vite dashboard SPA. Puerto: 5173.

## Resumen

Aplicación principal para usuarios autenticados. Explora empresas, organigramas, puestos, salarios y permite contribuciones anónimas.

## Estructura

```
src/
├── pages/                 # 4 páginas
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

## Páginas

| Página | Ruta | Descripción |
|--------|------|-------------|
| CompaniesPage | `/empresas` | Listado y búsqueda de empresas |
| CompanyPage | `/empresa/:slug` | Detalle de empresa (resumen, organigrama, puestos) |
| LoginPage | `/login` | Login con email o Google |
| AuthCallback | `/auth/callback` | Callback de OAuth |

## Componentes Principales

### Organigrama (ReactFlow)

| Componente | Props / Uso |
|------------|-------------|
| `Organigrama` | Canvas principal — recibe `companyId`, renderiza nodos y edges |
| `OrgChartNode` | Nodo personalizado — muestra título, cargo, departamento |
| `AddNodeDialog` | Modal — crear nuevo nodo con label, tipo, parent |
| `EditNodeDialog` | Modal — editar nodo existente |
| `NodeEditPanel` | Panel lateral — edición inline de propiedades |
| `Toolbar` | Barra superior — zoom, fit, export |
| `StatsFooter` | Footer — contadores (nodos, edges, profundidad) |
| `CustomControls` | Controles personalizados de zoom |
| `layout.ts` | Algoritmo de layout jerárquico |

### Auth

| Componente | Uso |
|------------|-----|
| `ProtectedRoute` | Wrapper — redirige a `/login` si no hay sesión |
| `LoginForm` | Formulario — email/password + botón Google |

### Layout

| Componente | Uso |
|------------|-----|
| `DashboardLayout` | Shell — sidebar responsive + topbar con user info |

## Dependencias Clave

- `@xyflow/react` — ReactFlow para organigramas
- `better-auth/react` — Cliente de autenticación
- `framer-motion` — Animaciones
- `tailwindcss` + `shadcn/ui` — Sistema de diseño

## Pendiente

- [ ] Vista detalle de puesto (`/empresa/:slug/puesto/:id`)
- [ ] Formulario de reportar salario
- [ ] Formulario de agregar comentario
- [ ] Navegación organigrama → puesto (click en nodo)
- [ ] Conectar organigrama con API real
- [ ] Modo edición colaborativo

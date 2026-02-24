# Brief — Empliq MVP (levels.fyi para Perú)

## Objetivo
Plataforma de **transparencia laboral** para el Perú. Inspirada en [levels.fyi](https://www.levels.fyi), adaptada al mercado peruano con diseño monocromático.

## Propuesta de Valor
"Descubre salarios reales, beneficios y experiencias dentro de las empresas más grandes del Perú."

---

## 📱 Producto MVP

### Concepto
Empliq es una plataforma tipo **red social de empresas**. Las empresas son los perfiles principales. Los usuarios contribuyen de forma **anónima** (públicamente), pero internamente se registra quién contribuye para moderación.

Cada perfil de empresa está compuesto por **3 secciones** (tabs):

### Referencia de Diseño
- **levels.fyi/companies/bcp** → referencia visual para el perfil de empresa
- Solo usamos: **About** (descripción, website, año fundación, nº empleados), **Top Insights** (comentarios)
- **NO usamos** (descartado del MVP): Salaries tab, Benefits tab, Jobs tab, Chat tab, Featured Jobs, Related Companies, Other Resources, Get Verified Salaries, buscador global, Estimated Revenue
- **Diseño monocromático** (blanco/negro/grises) — sin colores de marca

---

### 🏠 Tab 1 — Resumen (Overview)

Vista general de la empresa:

- **About**: Descripción breve de la empresa
- **Datos clave**: Website, año de fundación, nº de empleados, ubicación (departamento)
- **Logo** de la empresa (cuando disponible)
- **Top Insights**: Contribuciones/comentarios de la comunidad (anónimos)
- **Formulario** para agregar un insight

> Inspiración visual: la sección "About" + "Top Insights" de levels.fyi

### 📊 Tab 2 — Organigrama

Visualización interactiva del organigrama de la empresa usando **ReactFlow**:

- Nodos representan **puestos** (Position) dentro de la empresa
- Conexiones jerárquicas entre puestos (jefe → subordinado)
- Al hacer clic en un nodo → se abre el detalle del puesto (como modal o panel lateral)
- Muestra: título del puesto, nivel, nº de empleados estimados, salario medio si hay datos

> Esto es la app que desarrollamos con ReactFlow, integrada como tab del perfil de empresa.

### 📦 Tab 3 — Recursos

Todo lo que existe en el organigrama, listado como recursos navegables:

Cada **puesto** (Position) dentro de la empresa tiene:

| Recurso | Descripción |
|---------|-------------|
| **Salario** | Puede recibir múltiples reportes de sueldo. Se muestra la **media** (no valores individuales). Moneda: PEN. |
| **Comentarios** | Reviews anónimas sobre el puesto. Pros/contras, rating 1-5. |
| **Descripción del puesto** | De qué trata el puesto, responsabilidades. |
| **Entrevistas** | Documentos/información sobre el proceso de entrevista: preguntas, dificultad, consejos. |

> Los recursos se muestran agrupados por puesto. Es un directorio de puestos con toda la información disponible de cada uno.

---

## 🏗️ Arquitectura

### Decisión: Todo en Next.js (SSR + CSR)
Se migró la app React (Vite) al website Next.js. Razón: **SEO crítico** para una plataforma de contenido público. Las páginas de empresas, salarios y perfiles deben ser indexables por Google.

- **SSR**: Páginas públicas (empresa, salarios, búsqueda, landing)
- **CSR**: Interacciones (formularios, modales, auth state)
- **No se usa más**: React SPA (`apps/frontend`) — eliminado post-migración

### Stack Técnico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 16 + TailwindCSS 4 + shadcn/ui |
| **Auth** | Supabase Auth Self-Hosted (Google OAuth) |
| **Backend** | NestJS (Arquitectura Hexagonal) |
| **Base de datos** | PostgreSQL + Prisma ORM |
| **Scraper** | NestJS microservice (HTTP puro) |
| **Logo API** | logo.dev + Brandfetch → Oracle Object Storage |
| **Automatización** | n8n |
| **Infra** | Oracle Cloud ARM + Docker + Traefik |

---

## 📐 Estructura de la Plataforma

### Secciones Principales

| Sección | URL | Descripción |
|---------|-----|-------------|
| **Landing** | `/` | Landing page pública |
| **Empresas** | `/empresas` | Directorio de empresas con búsqueda y filtros |
| **Perfil Empresa** | `/empresas/[slug]` | Detalle con 3 tabs: Resumen, Organigrama, Recursos |
| **Login** | `/login` | Auth con Google OAuth o email/password |

### Perfil de Empresa (3 tabs MVP)

#### 1. Resumen (`/empresas/[slug]`)
- Logo y nombre de la empresa
- Descripción (About)
- Website, año fundación, nº empleados, ubicación
- Top Insights (comentarios de la comunidad)
- Formulario para agregar insight

#### 2. Organigrama (`/empresas/[slug]/organigrama`)
- Visualización ReactFlow del organigrama
- Nodos = Puestos con info resumida
- Click en nodo → detalle del puesto
- Relaciones jerárquicas (reporta a / subordinados)

#### 3. Recursos (`/empresas/[slug]/recursos`)
- Lista de puestos de la empresa
- Por cada puesto:
  - Salario medio (de múltiples reportes anónimos)
  - Comentarios/reviews (anónimos, rating 1-5)
  - Descripción del puesto
  - Info de entrevistas (preguntas, dificultad, consejos)

---

## 🗄️ Modelo de Datos

### Estrategia de 3 Bases de Datos

| DB | Servidor | Propósito |
|----|----------|-----------|
| `empliq_dev` | Oracle Cloud (163.176.250.185) | Datos crudos del scraper (JSONB). **No tocar.** Crece diariamente con n8n workflows. |
| `empliq_pre_prod` | Local Docker | Réplica de producción para pruebas. Se migran datos de empliq_dev aquí primero. |
| `empliq` | Local Docker (futuro: producción) | App de producción. Datos estructurados vía Prisma. Solo se publica cuando empliq_pre_prod está validado. |

### Pipeline de Migración

```
empliq_dev (Oracle)  ──[migrate_companies.py]──→  empliq_pre_prod (testing)
                                                         │
                                                    [validar]
                                                         │
                                                         ▼
                                                  empliq (producción)
```

- **Script**: `scripts/migrate_companies.py` (Python, SSH tunnel + psycopg2)
- **Frecuencia**: Al menos 1 vez al día
- **Incremental**: Solo migra RUCs no existentes en el destino
- **Tracking**: Cada migración se registra en tabla `_migration_log`
- **Idempotente**: Seguro para ejecutar múltiples veces
- **Logo-aware**: Mapea `logo_bucket_url` → `logo_url`

### Tabla de Tracking: `_migration_log`

```sql
CREATE TABLE _migration_log (
  id            SERIAL PRIMARY KEY,
  ruc           VARCHAR(11) NOT NULL,
  source_db     VARCHAR(50) NOT NULL,     -- 'empliq_dev'
  target_db     VARCHAR(50) NOT NULL,     -- 'empliq' | 'empliq_pre_prod'
  company_id    UUID,
  status        VARCHAR(20) NOT NULL,     -- 'success' | 'failed'
  error_message TEXT,
  migrated_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(ruc, target_db)
);
```

### Comandos de Migración

```bash
# Ver estadísticas
python3 scripts/migrate_companies.py --stats

# Preview sin escribir datos
python3 scripts/migrate_companies.py --dry-run --limit=10

# Migrar a empliq_pre_prod (default, seguro)
python3 scripts/migrate_companies.py

# Migrar a producción
python3 scripts/migrate_companies.py --target=empliq

# Solo actualizar logos
python3 scripts/migrate_companies.py --update-logos
```

### Entidades Principales (Prisma)

```
Profile (Supabase Auth) ──┐
                     ├── Salary    → position_id, amount, currency, period
                     ├── Review    → company_id, position_id?, rating, pros, cons
                     └── Interview → position_id, process, questions, difficulty

Company ──┐
          ├── Position ──┐
          │              ├── Salary[]     → media/rango
          │              ├── Review[]     → experiencias
          │              └── Interview[]  → entrevistas
          └── Benefit[]  → beneficios categorizados

JobCategory ── Position[]  → agrupación de puestos
```

### Categorías de Puestos

| Categoría | Ejemplos |
|-----------|----------|
| Tecnología | Desarrollador, Data Engineer, DevOps |
| Ingeniería | Civil, Mecánico, Industrial, Eléctrico |
| Finanzas | Contador, Analista Financiero, Auditor |
| Marketing y Ventas | Community Manager, Ejecutivo Comercial |
| Recursos Humanos | Reclutador, Analista RRHH |
| Operaciones | Logística, Supply Chain, Almacén |
| Legal | Abogado, Compliance |
| Salud | Médico, Enfermero |
| Administración | Asistente Administrativo, Gerente General |

---

## 🎨 Principios de Diseño

1. **Monocromático** — Solo blanco, negro, grises. Sin colores de marca.
2. **Anonimato público** — Contribuciones anónimas para el público
3. **Trazabilidad interna** — Se guarda quién contribuyó (moderación)
4. **Datos agregados** — Medias y rangos, no datos individuales
5. **Mobile-first** — Diseño responsive
6. **SEO-first** — SSR para todo contenido público
7. **Simple** — MVP sin features innecesarios

---

## 🚫 NO incluido en MVP (Post-MVP)

- Navegador global de salarios (`/salarios`) — por ahora solo dentro de cada empresa
- Tab de Beneficios separado (se maneja dentro de Recursos)
- Agregar nuevas empresas (solo admin/scraper)
- Sistema de verificación de empleados
- Notificaciones
- Comparador de salarios entre empresas
- Rankings de empresas
- API pública
- Chat / mensajería
- Buscador global
- Featured Jobs / Related Companies
- Mapa de headquarters
- Estimated Revenue

---

## 📊 Pipeline de Datos

### Fuente
- **Padrón RUC SUNAT** → 22,939 empresas segmentadas (Tier 1-5)
- **DatosPeru.org** → Enriquecimiento (razón social, dirección, ejecutivos, etc.)
- **logo.dev / Brandfetch** → Logos automáticos → Oracle Object Storage

### Segmentación

| Tier | Criterio | Empresas | Estado |
|------|----------|----------|--------|
| Tier 1 | ≥1000 trabajadores | 915 | ✅ Completado |
| Tier 2 | 500-999 | 798 | ✅ Completado |
| Tier 3 | 100-499 | 4,410 | ✅ Completado |
| Tier 4 | 50-99 | 4,858 | 🔄 En proceso |
| Tier 5 | 20-49 | 11,958 | 🔄 En proceso |
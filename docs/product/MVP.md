# Empliq - MVP (Minimum Viable Product)

> Definición del producto mínimo viable para la primera versión de Empliq.

## 📋 Índice

1. [Visión del Producto](#visión-del-producto)
2. [Actores Principales](#actores-principales)
3. [Estructura de Perfiles de Empresa](#estructura-de-perfiles-de-empresa)
4. [Funcionalidades del MVP](#funcionalidades-del-mvp)
5. [Modelo de Datos](#modelo-de-datos)
6. [Flujos de Usuario](#flujos-de-usuario)
7. [Pipeline de Datos](#pipeline-de-datos)

---

## Visión del Producto

Empliq es una plataforma tipo **red social laboral** donde las **empresas son los actores principales**. Los usuarios pueden:

- Explorar perfiles de empresas
- Ver organigramas interactivos
- Consultar información real de puestos y salarios
- Compartir experiencias de forma **anónima**

> **Nota de privacidad**: Aunque los comentarios son anónimos públicamente, se guarda registro del autor en la base de datos por temas de moderación y calidad de datos.

---

## Actores Principales

### 1. Empresas (Perfiles)
- Son el centro de la plataforma
- Cada empresa tiene un perfil público con:
  - Información general
  - Organigrama
  - Puestos/recursos
  - Comentarios agregados

### 2. Usuarios (Anónimos)
- Se autentican via Google/LinkedIn
- Pueden contribuir con:
  - Reportes de salario
  - Comentarios sobre puestos
  - Información de entrevistas
- **Sus contribuciones son anónimas públicamente**

---

## Estructura de Perfiles de Empresa

Cada perfil de empresa tiene **3 secciones principales**:

### 1. Resumen
- Descripción de la empresa
- Industria/sector
- Tamaño (rango de empleados)
- Ubicación(es)
- Cultura organizacional
- Beneficios generales

### 2. Organigrama
- Visualización interactiva con ReactFlow
- Estructura jerárquica de la empresa
- Áreas/departamentos
- Puestos dentro de cada área
- **Conexión directa con la sección de Recursos**

### 3. Recursos (Puestos)
Cada puesto tiene:

| Campo | Descripción |
|-------|-------------|
| **Título** | Nombre del puesto |
| **Departamento** | Área de la empresa |
| **Descripción** | De qué trata el puesto |
| **Salarios** | Múltiples reportes, mostramos la **media** |
| **Rango salarial** | Min - Max reportado |
| **Comentarios** | Experiencias anónimas |
| **Info de entrevistas** | Proceso, preguntas, duración |
| **Documentos** | Materiales de preparación |

---

## Funcionalidades del MVP

### ✅ Incluido en MVP

| Feature | Descripción |
|---------|-------------|
| **Autenticación** | Email/Password + Google OAuth via Better Auth |
| **Explorar empresas** | Listado y búsqueda de empresas |
| **Perfil de empresa** | Vista con las 3 secciones |
| **Organigrama** | Visualización con ReactFlow |
| **Ver puestos** | Listado de puestos por empresa |
| **Ver salarios** | Media y rango de salarios |
| **Ver comentarios** | Comentarios anónimos |
| **Agregar salario** | Reportar salario (anónimo) |
| **Agregar comentario** | Comentar sobre puesto (anónimo) |

### ❌ NO incluido en MVP (Post-MVP)

- Agregar nuevas empresas
- Editar organigramas
- Sistema de verificación de datos
- Notificaciones
- Comparador de salarios
- Rankings de empresas
- API pública

---

## Modelo de Datos

### Diagrama ER Simplificado

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │  companies  │       │ departments │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │◄──────│ id (PK)     │
│ email       │       │ name        │       │ company_id  │
│ full_name   │       │ slug        │       │ name        │
│ avatar_url  │       │ description │       │ description │
│ provider    │       │ industry    │       └─────────────┘
│ created_at  │       │ size        │              │
└─────────────┘       │ location    │              │
       │              │ website     │              ▼
       │              │ logo_url    │       ┌─────────────┐
       │              │ culture     │       │  positions  │
       │              │ benefits    │       ├─────────────┤
       │              │ created_at  │       │ id (PK)     │
       │              └─────────────┘       │ department_id│
       │                     │              │ title       │
       │                     │              │ description │
       │                     ▼              │ level       │
       │              ┌─────────────┐       └─────────────┘
       │              │ org_nodes   │              │
       │              ├─────────────┤              │
       │              │ id (PK)     │              │
       │              │ company_id  │              │
       │              │ position_id │◄─────────────┘
       │              │ parent_id   │
       │              │ label       │
       │              │ type        │
       │              │ metadata    │
       │              └─────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                    CONTRIBUCIONES                        │
├─────────────┬─────────────┬─────────────┬───────────────┤
│   salaries  │  comments   │ interviews  │   documents   │
├─────────────┼─────────────┼─────────────┼───────────────┤
│ id          │ id          │ id          │ id            │
│ position_id │ position_id │ position_id │ position_id   │
│ user_id*    │ user_id*    │ user_id*    │ user_id*      │
│ amount      │ content     │ process     │ title         │
│ currency    │ rating      │ difficulty  │ url           │
│ experience  │ pros        │ duration    │ type          │
│ is_verified │ cons        │ questions   │ description   │
│ created_at  │ created_at  │ got_offer   │ created_at    │
└─────────────┴─────────────┴─────────────┴───────────────┘

* user_id se guarda pero NO se muestra públicamente
```

### Entidades Principales

1. **users** - Usuarios autenticados (via Supabase Auth)
2. **companies** - Perfiles de empresas
3. **departments** - Departamentos/áreas de cada empresa
4. **positions** - Puestos de trabajo
5. **org_nodes** - Nodos del organigrama (ReactFlow)
6. **salaries** - Reportes de salario (anónimos)
7. **comments** - Comentarios sobre puestos (anónimos)
8. **interviews** - Información de entrevistas
9. **documents** - Documentos/recursos por puesto

---

## Flujos de Usuario

### 1. Nuevo Usuario

```
Landing (Website)
    │
    └─► Click "Comenzar gratis"
            │
            └─► Redirect a App (/login)
                    │
                    └─► Login con Google/LinkedIn
                            │
                            └─► Dashboard (/empresas)
```

### 2. Explorar Empresa

```
Dashboard (/empresas)
    │
    └─► Buscar/seleccionar empresa
            │
            └─► Perfil de empresa (/empresa/:id)
                    │
                    ├─► Resumen
                    │       └─► Ver info general
                    │
                    ├─► Organigrama
                    │       └─► Explorar estructura
                    │           └─► Click en puesto
                    │
                    └─► Recursos
                            └─► Ver puestos
                                └─► Ver salarios y comentarios
```

### 3. Contribuir (Reportar Salario)

```
Perfil de empresa
    │
    └─► Tab "Recursos"
            │
            └─► Seleccionar puesto
                    │
                    └─► Click "Reportar salario"
                            │
                            └─► Modal con formulario
                                    │
                                    └─► Enviar (anónimo públicamente)
                                            │
                                            └─► Salario agregado a la media
```

---

## Consideraciones Técnicas

### Stack

| Capa | Tecnología |
|------|------------|
| **Frontend** | React + Vite + TailwindCSS |
| **Auth** | Better Auth (Google, LinkedIn) |
| **Backend** | NestJS (Arquitectura Hexagonal) |
| **Database** | PostgreSQL |
| **Organigrama** | ReactFlow |
| **Automatización** | n8n |

### Principios

1. **Anonimato público** - Los usuarios contribuyen anónimamente
2. **Trazabilidad interna** - Se guarda quién contribuyó (moderación)
3. **Datos agregados** - Mostramos medias, no datos individuales
4. **Mobile-first** - Diseño responsive
5. **Performance** - Lazy loading, caching

---

## Pipeline de Datos

### Fuente de Datos
- **Padrón RUC SUNAT** (Perú): 13M+ registros
- Filtrado: 872K personas jurídicas
- Prioridad (Pareto): 6,123 empresas (≥100 trabajadores)

### Segmentación

| Tier | Criterio | Empresas |
|------|----------|----------|
| **Tier 1** | ≥1000 trabajadores | 915 |
| **Tier 2** | 500-999 trabajadores | 798 |
| **Tier 3** | 100-499 trabajadores | 4,410 |

### Automatización

#### Microservicio Scraper (`empliq-scraper-api`)

NestJS microservice standalone en `https://github.com/Mingbling1/empliq-scraper-api`.
Arquitectura hexagonal con 3 estrategias de búsqueda. Desplegado en Oracle Cloud vía CI/CD.

**Endpoints:**
| Método | Path | Descripción |
|--------|------|-------------|
| `GET` | `/search?q=EMPRESA&ruc=RUC` | Buscar web oficial (auto o strategy forzada) |
| `POST` | `/search/batch` | Búsqueda por lote (hasta 50) |
| `GET` | `/search/status` | Estado de todas las estrategias |
| `POST` | `/search/reset` | Resetear contadores |
| `GET` | `/search/health` | Healthcheck para n8n |
| `POST` | `/scrape/url` | Scraping directo de una URL conocida |
| `POST` | `/scrape/company` | Búsqueda + scraping en un solo paso |
| `GET` | `/enrich/datosperu?ruc=RUC` | **Enriquecimiento desde datosperu.org** |
| `GET` | `/logo/fetch?domain=DOMAIN&ruc=RUC` | **Descarga logo → Oracle bucket** (logo.dev primary, Brandfetch fallback) |

**Estrategias de búsqueda (prioridad automática):**
1. `ddg_http` — HTTP puro a DuckDuckGo (~1-2s, 200/sesión)
2. `bing_http` — HTTP puro a Bing (~1-2s, 150/sesión)
3. `univ_peru_http` — Búsqueda directa en universidadperu.com (~1.5s, 100/sesión)

**Logo Fetch (`GET /logo/fetch?domain=&ruc=`):**

Dado un dominio, descarga el logo desde logo.dev (500K free/mes, primario) o Brandfetch (100 free, fallback), lo sube a Oracle Object Storage, y devuelve la URL pública del bucket.
- Parámetro `domain` obligatorio, `ruc` opcional (para nombrar el archivo)
- Respuesta: `{ success, domain, provider, bucketUrl, format, sizeBytes, durationMs }`
- Diseñado para ser llamado desde n8n en el pipeline de enriquecimiento
- Archivo se guarda como `logos/{ruc}_{domain}.png` en el bucket

**Enriquecimiento DatosPeru (`GET /enrich/datosperu?ruc=`):"

Dado un RUC, busca en datosperu.org y extrae datos públicos estructurados:
- Razón social, estado, tipo, CIIU, sector económico
- Dirección completa (calle, departamento, provincia, distrito)
- Teléfonos, web oficial, si es proveedor del estado
- Ejecutivos/directores con cargo y fecha
- Establecimientos anexos (sucursales)
- Historial de trabajadores (mensual, últimos 20 periodos)
- Info histórica (condiciones, direcciones anteriores)
- Descripción (Top300), logo
- Todo HTTP puro (Cheerio), sin browser, ~2-5s por request

**Para n8n:**
```
GET http://localhost:3457/search?q={{$json.company_name}}
→ { found, website, score, strategies[].remainingCapacity }
```

#### Scraping de Websites (Playwright + Firefox)

> **¿Por qué no n8n?** n8n corre como servicio web (container/server) sin display gráfico,
> por lo que no puede controlar navegadores reales. Necesitamos Firefox real para evitar
> detección de bots por los buscadores.

**Solución: `orchestrator.js` + PM2**

```
orchestrator.js
    │
    ├─► firefox-scraper.js (Playwright + Firefox real)
    │       │
    │       ├─► DuckDuckGo (40 búsquedas/sesión)
    │       ├─► Bing (40 búsquedas/sesión)
    │       └─► Google (15 búsquedas/sesión, más estricto)
    │
    ├─► Rotación automática de motores
    ├─► Delays humanos (15-30s entre búsquedas)
    ├─► Pausas largas cada 15 empresas (2-3 min)
    └─► Progreso guardado en CSV (resumible)
```

**Ejecución:**
```bash
# Ver estado
node orchestrator.js --status

# Ejecutar con PM2 (recomendado)
npx pm2 start orchestrator.js --name scraper -- --headless
npx pm2 logs scraper
```

**Estrategia de Query:**
```
"<nombre comercial limpio>" peru sitio web oficial -site:linkedin.com -site:facebook.com
```
- Se limpia el nombre: quita SAC, SA, SRL, EIRL, etc.
- Se usan comillas para búsqueda exacta
- Se excluyen redes sociales con `-site:`
- Se puntúan resultados por TLD peruano (.pe, .com.pe) y coincidencia de nombre

Ver documentación completa: [DATA_PIPELINE.md](./DATA_PIPELINE.md)

---

## Próximos Pasos Post-MVP

1. Sistema de verificación de empleados
2. Comparador de salarios entre empresas
3. Rankings y reviews de empresas
4. API pública para integraciones
5. Notificaciones de cambios en empresas seguidas
6. Gamificación para incentivar contribuciones

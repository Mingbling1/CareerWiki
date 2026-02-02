# Empliq - MVP (Minimum Viable Product)

> Definición del producto mínimo viable para la primera versión de Empliq.

## 📋 Índice

1. [Visión del Producto](#visión-del-producto)
2. [Actores Principales](#actores-principales)
3. [Estructura de Perfiles de Empresa](#estructura-de-perfiles-de-empresa)
4. [Funcionalidades del MVP](#funcionalidades-del-mvp)
5. [Modelo de Datos](#modelo-de-datos)
6. [Flujos de Usuario](#flujos-de-usuario)

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
| **Auth** | Supabase Auth (Google, LinkedIn) |
| **Backend** | NestJS (Arquitectura Hexagonal) |
| **Database** | PostgreSQL (via Supabase) |
| **Organigrama** | ReactFlow |

### Principios

1. **Anonimato público** - Los usuarios contribuyen anónimamente
2. **Trazabilidad interna** - Se guarda quién contribuyó (moderación)
3. **Datos agregados** - Mostramos medias, no datos individuales
4. **Mobile-first** - Diseño responsive
5. **Performance** - Lazy loading, caching

---

## Próximos Pasos Post-MVP

1. Sistema de verificación de empleados
2. Comparador de salarios entre empresas
3. Rankings y reviews de empresas
4. API pública para integraciones
5. Notificaciones de cambios en empresas seguidas
6. Gamificación para incentivar contribuciones

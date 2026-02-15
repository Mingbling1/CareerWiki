# Brief - Landing Page & Producto MVP

## Objetivo
Captar usuarios interesados en conocer los requisitos reales de puestos de trabajo y construir conocimiento colaborativamente.

## Propuesta de Valor
"Descubre lo que realmente se necesita para conseguir el trabajo que quieres. Información real, de personas reales."

---

## 📱 Producto MVP — Red Social de Empresas

### Concepto
Empliq es una **red social laboral centrada en empresas**. Cada empresa es un "perfil" público con información estructurada. Los usuarios contribuyen de forma **anónima** (públicamente), aunque se registra internamente quién contribuye para moderación.

### Estructura de Perfiles

Cada perfil de empresa tiene **3 secciones principales**:

#### 1. 📋 Resumen
- Breve descripción de la empresa
- Industria / sector
- Tamaño (rango de empleados)
- Ubicación(es)
- Website oficial
- Logo (extraído automáticamente por el scraper: SVG, PNG, JPG)
- RUC
- Cultura organizacional
- Beneficios generales
- Año de fundación

#### 2. 🏗️ Organigrama
- Visualización interactiva con **ReactFlow**
- Estructura jerárquica: áreas → departamentos → puestos
- Click en un nodo → navega a la sección Recursos de ese puesto
- Datos colaborativos (post-MVP: edición en tiempo real)

#### 3. 👥 Recursos (Puestos)
Cada puesto dentro del organigrama tiene:

| Dato | Descripción |
|------|-------------|
| **Descripción** | De qué trata el puesto, responsabilidades |
| **Salarios** | Múltiples reportes anónimos → mostramos la **media** |
| **Rango salarial** | Mín - Máx reportado |
| **Comentarios** | Experiencias anónimas de trabajadores/ex-trabajadores |
| **Info de entrevistas** | Proceso, preguntas, duración, dificultad |
| **Documentos** | Materiales de preparación, guías, recursos |

### Stack Técnico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React + Vite + TailwindCSS + shadcn/ui |
| **Auth** | Better Auth (Google OAuth) |
| **Backend** | NestJS (Arquitectura Hexagonal) |
| **Base de datos** | PostgreSQL + Prisma ORM |
| **Organigrama** | ReactFlow |
| **Scraper** | NestJS microservice (HTTP puro, sin browser) |
| **Logo scraper** | Cheerio (extrae logo de JSON-LD, og:image, `<img>`, favicon) |
| **Automatización** | n8n |
| **Infra** | Oracle Cloud ARM + Docker + Traefik |

### Principios de Diseño
1. **Anonimato público** — contribuciones anónimas para el público
2. **Trazabilidad interna** — se guarda quién contribuyó (moderación)
3. **Datos agregados** — medias y rangos, no datos individuales
4. **Mobile-first** — diseño responsive
5. **Simple** — MVP sin features innecesarios

### Base de Datos (PostgreSQL + Prisma)

Modelos principales del MVP:

```
User ──┐
       ├── Salary     (positionId, amount, currency, period, yearsExperience)
       ├── Comment     (positionId, content, rating, pros, cons)
       ├── Interview   (positionId, process, questions, difficulty, duration, result, tips)
       └── Document    (positionId, title, url, type, category)

Company ──┐
          ├── Department ── Position ──┐
          ├── Position                 ├── Salary[]     → media/rango
          ├── OrgNode (ReactFlow)      ├── Comment[]    → experiencias
          └── OrgEdge (ReactFlow)      ├── Interview[]  → entrevistas
                                       └── Document[]   → recursos
```

**Notas de diseño:**
- Cada `Salary`, `Comment`, `Interview`, `Document` tiene `userId` (trazabilidad interna) pero se muestra anónimamente en el frontend.
- `Company` incluye campos enriquecidos por el scraper: `ruc`, `logoUrl`, `website`, `metadata` (JSON libre para datos adicionales como redes sociales, nº trabajadores, etc.)
- `Position` pertenece a una `Company` y opcionalmente a un `Department`.
- `OrgNode` vincula nodos del organigrama ReactFlow con `Position` y soporta jerarquía padre-hijo.
- Los salarios se muestran como **media** y **rango (min-max)** — nunca valores individuales.

### Estrategia de Datos: 2 bases de datos

| DB | Tabla | Propósito |
|----|-------|-----------|
| `empliq_dev` | `companies_raw` | Datos crudos del scraper (JSONB). Todo va al campo `data`. |
| `empliq` | `companies` + modelos Prisma | App de producción. Datos estructurados. |

**¿Por qué JSONB para scraper?** Los datos scrapeados son irregulares — algunas empresas tienen logo, ejecutivos, historial; otras solo RUC básico. En vez de 40+ columnas con NULLs, guardamos todo en un blob JSONB flexible. Cuando migremos a la app, extraemos solo lo que necesitamos.

---

## 🌐 Secciones de la Landing Page

### 1. Hero
- Headline impactante
- Subheadline explicativo
- CTA principal: "Explorar Empresas" o "Empezar Ahora"
- Ilustración/animación abstracta (WebGL opcional)

### 2. Problema
- Cards con los dolores del usuario:
  - "No sé qué habilidades necesito"
  - "Los rangos salariales son un misterio"
  - "Las descripciones de trabajo son genéricas"

### 3. Solución
- Explicación visual de cómo funciona:
  1. Explora perfiles de empresas
  2. Ve organigramas y puestos reales
  3. Consulta salarios y experiencias
  4. Contribuye anónimamente

### 4. Features
- Colaborativo: construido por la comunidad
- Transparente: información verificada
- Actualizado: datos en tiempo real

### 5. CTA Final
- Invitación a unirse
- Botón de acción

### 6. Footer
- Links básicos
- Copyright

## Tono de Comunicación
- Directo y cercano
- Empoderador ("tú puedes")
- Sin jerga corporativa

## Paleta de Colores
- Azul principal: #3b82f6
- Azul oscuro: #1e40af
- Blanco: #ffffff
- Gris claro: #f3f4f6
- Texto: #111827

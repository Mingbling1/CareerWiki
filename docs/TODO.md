# Empliq - TODO MVP

> Lista de pendientes para el Producto Mínimo Viable

## 📊 Estado General

| Módulo | Estado | Progreso |
|--------|--------|----------|
| 🏢 Empresas | 🟢 Completado | 100% |
| 📊 Organigrama | 🟢 Completado | 100% |
| 💰 Salarios | 🔴 Pendiente | 10% |
| 💬 Comentarios | 🔴 Pendiente | 10% |
| 🔐 Autenticación | 🟢 Completado | 100% |
| 🌐 Website (Landing) | 🟢 Completado | 100% |
| 📦 Storage (Oracle) | 🟢 Completado | 100% |
| 🔍 Scraper Websites | 🟢 Completado | 100% |
| 🏢 DatosPeru Enrichment | 🟢 Producción | 100% |

---

## 🏢 Módulo: Empresas

### Backend (API)
- [x] Entidad `Company`
- [x] Repository interface
- [x] Repository implementation (Prisma)
- [x] Use case: `GetCompanies`
- [x] Use case: `GetCompanyBySlug`
- [x] Use case: `CreateCompany` ✅ NEW
- [x] Use case: `UpdateCompany` ✅ NEW
- [x] Controller: `/api/companies`
- [x] Endpoint: Crear empresa (POST) ✅ NEW
- [x] Endpoint: Actualizar empresa (PUT) ✅ NEW
- [x] Upload de logo a Oracle Object Storage ✅ NEW
- [x] DTOs con validación (class-validator) ✅ NEW
- [ ] Seed de datos iniciales

### Frontend
- [x] Página listado de empresas (`CompaniesPage`)
- [x] Página detalle de empresa (`CompanyPage`)
- [x] Conectar con API real (servicio en `/lib/api.ts`)
- [x] Buscador funcional
- [x] Filtros por industria/ubicación

---

## 📦 Módulo: Storage (Oracle Object Storage)

### Backend
- [x] `StorageService` - Upload/Delete archivos
- [x] `StorageModule` - Módulo global NestJS
- [x] Upload de logos con prefijo `logos/`
- [x] PAR (Pre-Authenticated Request) para upload
- [x] URLs públicas para lectura
- [x] Configuración via variables de entorno

### Variables de entorno requeridas:
```
ORACLE_PAR_UPLOAD_URL=https://objectstorage.../o/
ORACLE_PUBLIC_URL_BASE=https://objectstorage.../o/
```

---

## 📊 Módulo: Organigrama

### Backend (API)
- [x] Entidad `OrgNode`
- [x] Repository interface
- [x] Repository implementation (Prisma)
- [x] Use case: `GetOrganigrama`
- [x] Controller: `/api/org-nodes`
- [ ] Endpoint: CRUD de nodos
- [ ] WebSocket para colaboración en tiempo real

### Frontend
- [x] Componente ReactFlow (`Organigrama.tsx`)
- [x] Nodos personalizados (`OrgChartNode.tsx`)
- [x] Controles y toolbar
- [ ] Integrar en perfil de empresa
- [ ] Conectar con API real
- [ ] Modo edición colaborativo

---

## 💰 Módulo: Salarios

### Backend (API)
- [x] Entidad `Salary`
- [x] Repository interface
- [x] Repository implementation (Prisma)
- [x] Use case: `AddSalary`
- [x] Use case: `GetSalaryStats`
- [x] Controller: `/api/salaries`
- [ ] Validación de datos
- [ ] Cálculo de media/mediana/rango
- [ ] Histograma de salarios

### Frontend
- [ ] Componente `SalaryCard` (mostrar stats)
- [ ] Formulario para reportar salario
- [ ] Gráficos de distribución
- [ ] Vista por puesto

---

## 💬 Módulo: Comentarios

### Backend (API)
- [x] Entidad `Comment`
- [x] Repository interface
- [x] Repository implementation (Prisma)
- [x] Use case: `AddComment`
- [x] Use case: `GetComments`
- [x] Controller: `/api/comments`
- [ ] Moderación de contenido
- [ ] Rate limiting

### Frontend
- [ ] Componente `CommentsList`
- [ ] Componente `CommentForm`
- [ ] Indicador de anonimato
- [ ] Vista por puesto

---

## 👤 Módulo: Puestos (Recursos)

### Backend (API)
- [x] Entidad `Position`
- [x] Repository interface
- [x] Repository implementation (Prisma)
- [x] Use case: `GetPositionsByCompany`
- [x] Controller: `/api/positions`
- [ ] Información de entrevistas
- [ ] Documentos adjuntos

### Frontend
- [ ] Página listado de puestos por empresa
- [ ] Página detalle de puesto
  - [ ] Descripción del puesto
  - [ ] Salarios (media)
  - [ ] Comentarios
  - [ ] Info de entrevistas
- [ ] Navegación desde organigrama

---

## 🔐 Módulo: Autenticación

### Backend (API)
- [x] Better Auth configurado
- [x] Google OAuth
- [x] Sesiones
- [ ] Middleware de protección de rutas
- [ ] Roles (admin/user)

### Frontend
- [x] Página de login
- [x] Contexto de autenticación
- [x] Rutas protegidas
- [x] Callback de OAuth
- [ ] Página de perfil de usuario

---

## 🌐 Website (Landing Page)

### Componentes
- [x] Header con navegación
- [x] Hero section
- [x] Features section
- [x] Use Cases section
- [x] Testimonials section
- [x] CTA section
- [x] Footer
- [x] Logo Cloud

### Extras
- [x] Efectos de gradiente
- [x] Responsive design
- [ ] SEO meta tags
- [ ] Analytics

---

## 🗄️ Base de Datos

### Tablas
- [x] `companies`
- [x] `positions`
- [x] `departments`
- [x] `org_nodes`
- [x] `org_edges`
- [x] `salaries`
- [x] `comments`
- [x] `interviews`
- [x] `documents`
- [x] `users` (Better Auth)
- [x] `sessions` (Better Auth)
- [x] `accounts` (Better Auth)
- [x] `companies_staging` (n8n scraper pipeline)

### Migraciones
- [x] Schema inicial (Prisma)
- [x] Script SQL de inicialización
- [x] Modelo Document en Prisma
- [x] Modelo Interview en Prisma
- [x] Moneda por defecto PEN (Perú)
- [ ] Seed de datos de prueba

---

## � Módulo: Scraper de Websites

### Herramientas
- [x] `google-search.js` - Scraper rápido con Puppeteer (DuckDuckGo + Bing)
- [x] `firefox-scraper.js` - Scraper lento con Playwright + Firefox real
  - [x] Rotación multi-motor (DuckDuckGo → Bing → Google)
  - [x] Comportamiento humano (typing lento, mouse moves, scrolls)
  - [x] Anti-ban (pausas largas, rotación de engines)
  - [x] Query optimizada con nombre comercial limpio
  - [x] Batch processing con progreso resumible
- [x] `orchestrator.js` - Orquestador de scraping por tiers
  - [x] Procesa Tier 1 → 2 → 3 automáticamente
  - [x] Guarda progreso (resume si se interrumpe)
  - [x] Compatible con PM2 para ejecución larga

### Datos
- [x] Tier 1: 915 empresas (≥1000 trabajadores)
- [x] Tier 2: 798 empresas (500-999 trabajadores)
- [x] Tier 3: 4,410 empresas (100-499 trabajadores)
- [ ] Ejecutar scraping completo Tier 1
- [ ] Ejecutar scraping completo Tier 2
- [ ] Ejecutar scraping completo Tier 3
- [ ] Importar resultados a PostgreSQL

### Microservicio `api-scraper` (NestJS)
- [x] Arquitectura hexagonal (domain/application/infrastructure)
- [x] Puerto `SearchEnginePort` con 3 adaptadores
- [x] Adaptador DDG HTTP (rápido, sin browser)
- [x] Adaptador Puppeteer (Chromium + DDG/Bing)
- [x] Adaptador Playwright (Firefox multi-motor)
- [x] Orquestador inteligente con fallback automático
- [x] DTOs con `class-validator` (equivalente a Pydantic)
- [x] Swagger API docs en `/docs`
- [x] Rate limit tracking por estrategia
- [x] Cooldown automático tras 3 errores consecutivos
- [x] Endpoint `/search/status` para n8n
- [x] Batch endpoint (hasta 50 empresas)
- [x] Dockerfile
- [x] CI/CD (GitHub Actions → Oracle Cloud)
- [x] Deploy script con Traefik labels
- [x] Integrado en oracle-dokploy deploy-https.sh
- [x] Integración con n8n workflow (v5)
- [x] Persistencia en PostgreSQL (companies_staging)

### DatosPeru Enrichment ✅
- [x] Adapter: `DatosPeruHttpAdapter` (875 líneas)
- [x] Puerto: `DatosPeruEnrichmentPort`
- [x] Entidad: `DatosPeruProfile` con interfaces tipadas
- [x] Controller: `GET /enrich/datosperu?ruc=XXXXXXXXXXX`
- [x] DTOs con Swagger docs
- [x] Parser de datos empresa (nombre, RUC, estado, tipo, CIIU)
- [x] Parser de ejecutivos (cargo, nombre, fecha)
- [x] Parser de establecimientos anexos
- [x] Parser de historial trabajadores
- [x] Parser de info histórica (condiciones, direcciones)
- [x] Parser de sector económico y comercio exterior
- [x] Parser de logo (`<img src*="top300">` → URL completa)
- [x] Parser de descripción corporativa
- [x] Bypass Cloudflare: Alpine Docker + curl 8.17/OpenSSL 3.5
- [x] SOCKS5 proxy rotation (5 seed proxies)
- [x] Fallback chain: directGet → proxyRotation → curlGet → curlDirectGet
- [x] Modo directo (`DATOSPERU_DIRECT=true`) para IP residencial
- [x] Producción funcionando (~12s/empresa, 15+ campos)

### Orquestación (n8n)
- [x] Workflow v5 con DatosPeru enrichment + Search + Scrape
- [x] Logo URL extraído de DatosPeru (Top300)
- [x] Tabla `companies_staging` con `datos_peru_data JSONB`
- [x] Upsert por RUC (match on conflict)
- [x] Wait 25s entre items (anti-blocking)
- [ ] Ejecutar pipeline Tier 1 completo
- [ ] Ejecutar pipeline Tier 2
- [ ] Ejecutar pipeline Tier 3

```bash
# Microservicio (recomendado)
cd apps/api-scraper && npm run dev
# → http://localhost:3457/docs (Swagger)
# → http://localhost:3457/search?q=INTERBANK

# Scripts standalone (alternativa)
node orchestrator.js --status
npx pm2 start orchestrator.js --name scraper -- --headless
```

---

## �🐳 DevOps

### Docker
- [x] Dockerfile API
- [x] Dockerfile Frontend
- [x] Dockerfile Website
- [x] Dockerfile Scraper (multi-stage, ARM64)
- [x] docker-compose.dev.yml
- [x] Hot reload configurado
- [ ] docker-compose.prod.yml

### CI/CD
- [x] oracle-dokploy: deploy-https.sh con todos los servicios
- [x] oracle-dokploy: GitHub Actions workflow
- [x] empliq-scraper-api: deploy.sh standalone
- [x] empliq-scraper-api: GitHub Actions CI/CD
- [x] Scraper integrado en oracle-dokploy deploy-https.sh
- [x] API Key auth para scraper (x-api-key header)
- [x] Traefik labels para scraper.musuq.me
- [ ] Configurar secrets en GitHub (SCRAPER_API_KEY)

---

## 📋 Próximos Pasos (Prioridad)

1. **Conectar Frontend con API real**
   - Reemplazar mock data en CompaniesPage
   - Implementar fetching de datos

2. **Seed de datos**
   - Crear empresas de ejemplo
   - Crear puestos
   - Crear salarios de prueba

3. **Vista de Puesto**
   - Página de detalle de puesto
   - Mostrar salarios + comentarios

4. **Formularios de contribución**
   - Formulario para reportar salario
   - Formulario para agregar comentario

---

## 🎯 Definición de "Done" para MVP

- [ ] Usuario puede explorar empresas
- [ ] Usuario puede ver organigrama de una empresa
- [ ] Usuario puede ver puestos de una empresa
- [ ] Usuario puede ver salarios de un puesto (media)
- [ ] Usuario puede ver comentarios de un puesto
- [ ] Usuario autenticado puede reportar salario
- [ ] Usuario autenticado puede agregar comentario
- [ ] Comentarios son anónimos públicamente
- [ ] Landing page funcional

---

*Última actualización: 14 de febrero de 2026*

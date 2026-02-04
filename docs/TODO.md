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
- [x] `org_nodes`
- [x] `salaries`
- [x] `comments`
- [x] `users` (Better Auth)
- [x] `sessions` (Better Auth)
- [x] `accounts` (Better Auth)

### Migraciones
- [x] Schema inicial (Prisma)
- [x] Script SQL de inicialización
- [ ] Seed de datos de prueba

---

## 🐳 DevOps

### Docker
- [x] Dockerfile API
- [x] Dockerfile Frontend
- [x] Dockerfile Website
- [x] docker-compose.dev.yml
- [x] Hot reload configurado
- [ ] docker-compose.prod.yml
- [ ] CI/CD pipeline

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

*Última actualización: 3 de febrero de 2026*

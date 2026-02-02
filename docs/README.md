# Empliq - Documentación Técnica

> Plataforma de transparencia laboral para profesionales en México y Latinoamérica.

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Guías de Desarrollo](#guías-de-desarrollo)

---

## Visión General

**Empliq** es una plataforma colaborativa donde profesionales comparten información verificada sobre:
- Salarios reales por puesto y empresa
- Requisitos y habilidades de puestos
- Estructuras organizacionales (organigramas)
- Experiencias laborales anónimas

### Propuesta de Valor
"Descubre lo que realmente se necesita para conseguir el trabajo que quieres. Información real, de personas reales."

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │   Website       │    │   App (React)   │                     │
│  │   (Next.js)     │    │   SPA           │                     │
│  │   Landing Page  │    │   Dashboard     │                     │
│  └────────┬────────┘    └────────┬────────┘                     │
│           │                      │                               │
│           └──────────┬───────────┘                               │
│                      │                                           │
│                      ▼                                           │
│           ┌─────────────────────┐                               │
│           │   Supabase Auth     │  ← Google, LinkedIn OAuth     │
│           │   (Auth Provider)   │                               │
│           └──────────┬──────────┘                               │
└──────────────────────│──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              NestJS (Arquitectura Hexagonal)             │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │ Application │  │   Domain    │  │Infrastructure│      │    │
│  │  │   Layer     │  │   Layer     │  │    Layer    │      │    │
│  │  │ (Use Cases) │  │  (Entities) │  │  (Adapters) │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│                    ┌─────────────────┐                          │
│                    │   PostgreSQL    │                          │
│                    │   (Supabase)    │                          │
│                    └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

### Arquitectura Hexagonal (Ports & Adapters)

El backend sigue el patrón de Arquitectura Hexagonal para mantener el dominio desacoplado:

```
src/
├── domain/                    # 🔵 Núcleo del negocio (sin dependencias externas)
│   ├── entities/              # Entidades de dominio
│   ├── value-objects/         # Objetos de valor
│   ├── repositories/          # Interfaces de repositorios (Ports)
│   └── services/              # Servicios de dominio
│
├── application/               # 🟢 Casos de uso
│   ├── use-cases/             # Implementación de casos de uso
│   ├── dtos/                  # Data Transfer Objects
│   └── ports/                 # Interfaces de servicios externos
│
└── infrastructure/            # 🟠 Adaptadores e implementaciones
    ├── persistence/           # Implementación de repositorios (PostgreSQL)
    ├── http/                  # Controladores REST
    ├── auth/                  # Integración con Supabase Auth
    └── external-services/     # Servicios externos
```

---

## Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.x | UI Library |
| **TypeScript** | 5.x | Tipado estático |
| **Vite** | 6.x | Build tool |
| **TailwindCSS** | 4.x | Estilos utility-first |
| **React Query** | 5.x | Estado del servidor |
| **Zustand** | 5.x | Estado global |
| **React Router** | 7.x | Routing |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | 11.x | Framework backend |
| **TypeScript** | 5.x | Tipado estático |
| **PostgreSQL** | 16.x | Base de datos |
| **Prisma** | 6.x | ORM |
| **Supabase** | - | Auth + DB hosting |

### Website (Landing)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16.x | Framework React SSR |
| **Three.js** | - | WebGL backgrounds |
| **TailwindCSS** | 4.x | Estilos |

---

## Estructura del Proyecto

```
empliq/
├── apps/
│   ├── website/               # Landing page (Next.js)
│   ├── web/                   # App principal (React + Vite)
│   └── api/                   # Backend (NestJS) [por crear]
│
├── packages/                  # Paquetes compartidos [por crear]
│   ├── ui/                    # Componentes UI compartidos
│   ├── types/                 # Tipos TypeScript compartidos
│   └── utils/                 # Utilidades compartidas
│
├── docs/                      # Documentación
│   ├── README.md              # Este archivo
│   ├── DESIGN_SYSTEM.md       # Sistema de diseño
│   ├── API.md                 # Documentación API
│   └── ARCHITECTURE.md        # Arquitectura detallada
│
└── infrastructure/            # Configuración de infraestructura
    ├── docker/
    └── kubernetes/
```

---

## Guías de Desarrollo

### Documentos Relacionados

- [Sistema de Diseño](./DESIGN_SYSTEM.md) - Tipografía, colores, componentes
- [Arquitectura](./ARCHITECTURE.md) - Detalles de arquitectura hexagonal
- [API](./API.md) - Endpoints y contratos
- [Brief Landing](./BRIEF_LANDING.md) - Especificaciones del website

### Comandos Rápidos

```bash
# Desarrollo website
cd apps/website && npm run dev

# Desarrollo app
cd apps/web && npm run dev

# Desarrollo API (cuando esté configurado)
cd apps/api && npm run start:dev
```

---

## Autenticación

Utilizamos **Supabase Auth** como proveedor de autenticación, con soporte para:
- Google OAuth
- LinkedIn OAuth
- Email/Password (opcional)

Ver [AUTH.md](./AUTH.md) para detalles de implementación.

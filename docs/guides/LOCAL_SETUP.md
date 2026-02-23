# Guía: Setup Local

> Cómo levantar todo el entorno de desarrollo.

## Prerrequisitos

- Docker + Docker Compose
- Node.js 20+
- Git

## 1. Clonar y configurar

```bash
git clone https://github.com/Mingbling1/sueldos-organigrama.git
cd sueldos-organigrama
```

## 2. Variables de entorno

Crear `.env` en `apps/api/`:

```env
DATABASE_URL=postgresql://empliq:empliq_dev@localhost:5432/empliq
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:4000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ORACLE_PAR_UPLOAD_URL=https://objectstorage.../o/
ORACLE_PUBLIC_URL_BASE=https://objectstorage.../o/
```

Crear `.env` en `apps/empliq-scraper-api/`:

```env
PORT=3457
API_KEY=dev-api-key
DATOSPERU_DIRECT=true
DATABASE_URL=postgresql://empliq:empliq_dev@localhost:5432/empliq_dev
```

## 3. Levantar con Docker

```bash
cd docker
docker compose -f docker-compose.dev.yml up -d
```

Esto levanta 5 contenedores:

| Servicio | Puerto | URL |
|----------|--------|-----|
| PostgreSQL | 5432 | `postgresql://empliq:empliq_dev@localhost:5432/empliq` |
| API (NestJS) | 4000 | http://localhost:4000 |
| Frontend (React) | 5173 | http://localhost:5173 |
| Website (Next.js) | 3000 | http://localhost:3000 |
| Scraper API | 3457 | http://localhost:3457/docs |

## 4. Verificar

```bash
# Ver logs de todos los servicios
docker compose -f docker-compose.dev.yml logs -f

# Verificar que todos están running
docker compose -f docker-compose.dev.yml ps

# Test rápido
curl http://localhost:4000/api/companies
curl http://localhost:3000
```

## 5. Desarrollo sin Docker (alternativa)

```bash
# Terminal 1: API
cd apps/api && npm install && npm run start:dev

# Terminal 2: Frontend
cd apps/frontend && npm install && npm run dev

# Terminal 3: Website
cd apps/website && npm install && npm run dev
```

Requiere PostgreSQL local corriendo en :5432.

## 6. Prisma

```bash
cd apps/api

# Generar cliente
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_descriptivo

# Ver DB en browser
npx prisma studio
```

## Hot Reload

- Docker volumes montan el código fuente directamente
- Cambios en `.tsx`, `.ts` se reflejan automáticamente
- Si cambias `package.json` o Prisma schema, rebuild: `docker compose up -d --build`

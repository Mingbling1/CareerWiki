# 🐳 Docker - Empliq Development

## Requisitos

- Docker Desktop o Docker Engine
- Docker Compose v2+

## Inicio Rápido

### 1. Configurar variables de entorno

```bash
cp docker/.env.example docker/.env
# Editar docker/.env con tus valores
```

### 2. Levantar servicios

```bash
# Desde la raíz del proyecto
npm run docker:dev

# O directamente con docker-compose
docker-compose -f docker/docker-compose.dev.yml up
```

### 3. Acceder a los servicios

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Web App** | http://localhost:5173 | App React (dashboard) |
| **Website** | http://localhost:3000 | Landing page Next.js |
| **PostgreSQL** | localhost:5432 | Base de datos |

## Servicios Disponibles

### 🌐 Web App (React + Vite)

La aplicación principal de Empliq con:
- Dashboard de empresas
- Organigrama interactivo
- Autenticación con Supabase

```bash
# Solo levantar la app web
docker-compose -f docker/docker-compose.dev.yml up web
```

### 📄 Website (Next.js)

Landing page con:
- WebGL hero canvas
- Información del producto
- CTA para registro

```bash
# Solo levantar el website
docker-compose -f docker/docker-compose.dev.yml up website
```

### 🐘 PostgreSQL

Base de datos local para desarrollo (alternativa a Supabase):

```bash
# Solo levantar PostgreSQL
docker-compose -f docker/docker-compose.dev.yml up postgres

# Conectarse a la base de datos
docker exec -it empliq-postgres psql -U empliq -d empliq
```

El schema se carga automáticamente desde `docs/database/schema.sql`.

## Comandos Útiles

```bash
# Reconstruir imágenes
npm run docker:build

# Ver logs
docker-compose -f docker/docker-compose.dev.yml logs -f

# Logs de un servicio específico
docker-compose -f docker/docker-compose.dev.yml logs -f web

# Detener servicios
docker-compose -f docker/docker-compose.dev.yml down

# Detener y eliminar volúmenes (reset DB)
docker-compose -f docker/docker-compose.dev.yml down -v
```

## Desarrollo con Hot Reload

Los volúmenes están configurados para hot reload:

- `apps/web` → Cambios se reflejan automáticamente
- `apps/landing` → Cambios se reflejan automáticamente

## Notas

### Sin Supabase

Para desarrollo local sin Supabase, usa el PostgreSQL incluido. Tendrás que:

1. Ajustar la configuración de auth en la app
2. Usar PostgreSQL directo en lugar de Supabase client

### Con Supabase (Recomendado)

Para usar Supabase Auth:

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia las credenciales a `docker/.env`
3. Ejecuta el schema SQL en el SQL Editor de Supabase

## Troubleshooting

### Puerto ocupado

```bash
# Verificar puertos
lsof -i :5173
lsof -i :3000
lsof -i :5432
```

### Permisos en Linux

```bash
# Si hay problemas con node_modules
sudo chown -R $USER:$USER apps/
```

### Reiniciar desde cero

```bash
docker-compose -f docker/docker-compose.dev.yml down -v
docker system prune -f
npm run docker:dev
```

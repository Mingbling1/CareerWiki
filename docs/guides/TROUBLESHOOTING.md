# Guía: Troubleshooting

> Problemas comunes y cómo resolverlos.

## Docker

### Container no arranca

```bash
# Ver logs del servicio específico
docker logs empliq-api --tail 50

# Verificar que postgres está ready
docker exec empliq-postgres pg_isready

# Rebuild forzado
docker compose -f docker-compose.dev.yml up -d --build --force-recreate
```

### Puerto en uso

```bash
# Encontrar qué usa el puerto
lsof -i :4000
# o
ss -tlnp | grep 4000

# Kill del proceso
kill -9 <PID>
```

### Hot reload no funciona

1. Verificar que los volumes están montados correctamente en `docker-compose.dev.yml`
2. Verificar que el archivo cambió dentro del container: `docker exec empliq-api ls -la src/`
3. A veces NestJS necesita restart: `docker restart empliq-api`

## PostgreSQL

### No puedo conectar

```bash
# Verificar que corre
docker exec empliq-postgres pg_isready

# Conectar manualmente
docker exec -it empliq-postgres psql -U empliq -d empliq

# Ver bases de datos
\l

# Ver tablas
\dt
```

### Prisma migration falla

```bash
# Reset completo ( borra datos)
cd apps/api
npx prisma migrate reset

# Solo generar cliente sin migrar
npx prisma generate
```

## Auth

### OAuth callback falla

1. Verificar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env`
2. Verificar que `http://localhost:4000/api/auth/callback/google` está en los Authorized Redirect URIs de Google Cloud Console
3. Verificar `trustedOrigins` en `apps/api/src/infrastructure/auth/auth.ts`

### Sesión expira inmediatamente

- Verificar `BETTER_AUTH_SECRET` — debe ser al menos 32 caracteres
- Verificar que cookies se envían con `credentials: 'include'` en el frontend

## Scraper

### DatosPeru Cloudflare block

```bash
# Verificar con curl directo
docker exec empliq-scraper curl -I https://www.datosperu.org/

# Si falla, activar proxy rotation
# En .env del scraper:
DATOSPERU_DIRECT=false
```

### API Key rechazada

- Header correcto: `x-api-key: your-key`
- Verificar `API_KEY` en `.env` del scraper

## Website

### Build falla (Next.js)

```bash
# Ver errores
docker logs empliq-website --tail 50

# Build local para debug
cd apps/website
npm run build
```

### Module not found en Docker (react-hook-form, @hookform/resolvers, etc.)

**Síntoma:** `Module not found: Can't resolve 'react-hook-form'` o `@hookform/resolvers/zod`
solo en Docker, pero funciona en local.

**Causa:** El `docker-compose.dev.yml` usa un **anonymous volume** (`- /app/node_modules`)
para preservar `node_modules` del container separados del host. Cuando se agregan nuevas
dependencias al `package.json` del website, el volume anónimo antiguo persiste con su
`node_modules` obsoleto y no incluye los nuevos paquetes.

**Solución:**

```bash
cd docker

# 1. Parar y eliminar el container + su volume anónimo
docker compose -f docker-compose.dev.yml stop website
docker rm -v empliq-website

# 2. Rebuild sin cache (fuerza npm install fresco)
docker compose -f docker-compose.dev.yml build --no-cache website

# 3. Levantar con volume nuevo
docker compose -f docker-compose.dev.yml up -d website

# 4. Verificar paquetes dentro del container
docker exec empliq-website ls node_modules/react-hook-form
docker exec empliq-website ls node_modules/@hookform/resolvers/zod
```

**Regla:** Cada vez que se agrega una dependencia nueva al `package.json` del website,
se debe hacer rebuild del container con `--no-cache` y eliminar el volume anónimo.

### Shader no renderiza

- Es normal en SSR — `Shader3` usa `dynamic(() => import(...), { ssr: false })`
- Solo renderiza client-side después del mount

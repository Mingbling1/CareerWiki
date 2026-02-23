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
# Reset completo (⚠️ borra datos)
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

### Shader no renderiza

- Es normal en SSR — `Shader3` usa `dynamic(() => import(...), { ssr: false })`
- Solo renderiza client-side después del mount

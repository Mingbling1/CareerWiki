# Migración de Datos — Empliq

> **Última actualización:** 27 de febrero de 2026

## Arquitectura de 3 Bases de Datos

Empliq opera con **3 bases de datos PostgreSQL** que cumplen roles completamente distintos.
Nunca se deben confundir ni mezclar sus propósitos.

```
┌─────────────────────────────────────────────────────────┐
│  Oracle Cloud (163.176.250.185)                         │
│  Container: musuq-postgres                              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ DB: empliq_dev                                  │    │
│  │ Tabla: companies_raw (JSONB)                    │    │
│  │ ~25,000+ empresas (crece diariamente)           │    │
│  │ Fuente: n8n workflows + scrapers + DatosPeru    │    │
│  │ Datos NO estructurados, raw de múltiples fuentes│    │
│  └──────────────────┬──────────────────────────────┘    │
│                     │                                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ DB: empliq_prod  (SOLO PRODUCCIÓN)              │    │
│  │ Schema: Prisma (9 modelos, gestionado por       │    │
│  │   prisma migrate deploy)                        │    │
│  │   NUNCA modificar directamente                │    │
│  │ Auth: GoTrue prod (auth.empliq.io)              │    │
│  │ ~24,860 empresas migradas                       │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                     │
            [migrate_companies.py]
            (SSH tunnel + psycopg2)
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Local Docker (empliq-postgres :5432)                   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ DB: empliq_pre_prod (STAGING / TESTING)         │    │
│  │ Schema: Prisma (gestionado por prisma db push)  │    │
│  │ → Estructura idónea que llevará producción      │    │
│  │ → Se hacen múltiples pruebas aquí               │    │
│  │ → El backend local consume esta BD              │    │
│  │ Auth: GoTrue local (localhost:8000)              │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Roles de cada base de datos

| Base de datos | Entorno | Propósito | Quién la consume | Seguridad |
|---|---|---|---|---|
| **empliq_dev** | Oracle Cloud | Raw data de scrapers. JSONB no estructurado. Crece diariamente. | Scripts de migración, n8n workflows | Se puede resetear/recrear |
| **empliq_pre_prod** | Local Docker | Staging. Estructura idónea Prisma. Pruebas locales. | Backend local (:4000) + GoTrue local | Se puede resetear/recrear |
| **empliq_prod** | Oracle Cloud | Producción. Misma estructura que pre_prod. Datos de usuarios. | Backend prod (api.empliq.io) + GoTrue prod (auth.empliq.io) |  **NUNCA** modificar directamente |

###  Regla crítica: empliq_prod

Desde la versión 1, `empliq_prod` contendrá datos de usuarios reales (perfiles, salarios, reviews).
Las migraciones a producción deben ser:
- **Incrementales**: Solo agregar datos nuevos, nunca borrar existentes
- **Via Prisma**: Los cambios de schema SIEMPRE van por `prisma migrate deploy`
- **Testeadas**: Primero probar TODA modificación en `empliq_pre_prod`
- **Sin pérdida**: Nunca `--reset` en producción

---

## Supabase Auth (GoTrue) y Bases de Datos

### Local
- GoTrue conecta a `empliq_pre_prod` (schema `auth`)
- Solo para desarrollo y probar OAuth funcione
- Usuarios locales NO afectan producción
- config: `docker-compose.dev.yml` → `GOTRUE_DB_DATABASE_URL`

### Producción
- GoTrue conecta a `empliq_prod` (schema `auth`)
- Usuarios reales, sesiones reales
- config: `auth.empliq.io`

**Ambos GoTrue** crean y gestionan el schema `auth` automáticamente (52 migraciones internas).
El schema `public` lo gestiona Prisma.

---

## Script de Migración

**Ubicación**: `scripts/migrate_companies.py`

**Dependencias**:
```bash
pip install psycopg2-binary
```

**Nota**: Usa SSH tunnel nativo (subprocess) en vez de paramiko/sshtunnel por compatibilidad con Python 3.14.

## Uso

### Ver estadísticas
```bash
python3 scripts/migrate_companies.py --stats
```

### Preview (sin escribir datos)
```bash
python3 scripts/migrate_companies.py --dry-run --limit=10
```

### Migrar a empliq_pre_prod (default, seguro)
```bash
python3 scripts/migrate_companies.py
```

### Migrar a producción (con mucho cuidado)
```bash
# SIEMPRE hacer dry-run primero
python3 scripts/migrate_companies.py --target=empliq_prod --dry-run
python3 scripts/migrate_companies.py --target=empliq_prod
```

### Solo actualizar logos
```bash
python3 scripts/migrate_companies.py --update-logos
```

### Migrar las últimas N empresas
```bash
python3 scripts/migrate_companies.py --limit=100
```

### Reset (SOLO pre_prod, NUNCA producción)
```bash
python3 scripts/migrate_companies.py --reset --target=empliq_pre_prod
```

## Tabla de Tracking

Cada migración se registra en `_migration_log`:

```sql
SELECT ruc, source_db, target_db, status, migrated_at
FROM _migration_log
ORDER BY migrated_at DESC
LIMIT 20;
```

Ver fallos:
```sql
SELECT ruc, error_message, migrated_at
FROM _migration_log
WHERE status = 'failed'
ORDER BY migrated_at DESC;
```

## Mapeo de Campos

| Source (empliq_dev.companies_raw) | Target (companies) |
|---|---|
| `ruc` | `ruc` |
| `data->>'name'` o `razon_social` | `name` |
| `generate_slug(name)` | `slug` |
| `data->>'description'` | `description` |
| `data->>'sector_economico'` o `data->>'industry'` | `industry` |
| `data->>'nro_trabajadores'` | `employee_count` |
| `distrito, provincia, departamento` | `location` (concatenado) |
| `data->>'website'` | `website` |
| `logo_bucket_url` | `logo_url` |
| `data->>'fecha_inicio'` (year) o `data->>'founded_year'` | `founded_year` |
| `{razon_social, source, migrated_at, rich_fields...}` | `metadata` (JSONB) |

### Metadata JSONB (campos ricos preservados)

El campo `metadata` almacena toda la información del scraper que no tiene columna directa:
`direccion`, `sector_economico`, `actividad_ciiu`, `tipo_empresa`, `condicion`, `estado`,
`fecha_inicio`, `fecha_inscripcion`, `telefonos`, `ejecutivos`, `historial_trabajadores`,
`historial_condiciones`, `historial_direcciones`, `establecimientos_anexos`,
`comercio_exterior`, `referencia`, `proveedor_estado`, `tier`.

## Flujo de Trabajo

1. **Oracle crece**: n8n workflows y scrapers enriquecen `empliq_dev` diariamente
2. **Migrar a pre_prod**: `python3 scripts/migrate_companies.py` (incremental, solo nuevos RUCs)
3. **Validar**: Verificar la app localmente con datos de `empliq_pre_prod` via backend local (:4000)
4. **Iterar schema**: Si se necesitan cambios de schema, hacerlos en Prisma → `prisma db push` a pre_prod
5. **Producción**: `python3 scripts/migrate_companies.py --target=empliq_prod` (cuando pre_prod esté validado)
6. **Schema prod**: `prisma migrate deploy` contra empliq_prod (via DATABASE_URL temporal)

## Configuración

Variables de entorno (todas con defaults):

| Variable | Default | Descripción |
|---|---|---|
| `ORACLE_HOST` | `163.176.250.185` | IP del servidor Oracle |
| `ORACLE_SSH_KEY` | `~/.ssh/oracle_instance_key` | Llave SSH |
| `LOCAL_DB_USER` | `empliq` | Usuario PostgreSQL local |
| `LOCAL_DB_PASS` | `empliq_dev_password` | Password PostgreSQL local |
| `LOCAL_DB_HOST` | `localhost` | Host PostgreSQL local |
| `LOCAL_DB_PORT` | `5432` | Puerto PostgreSQL local |

---

## Migración Rápida con dblink (Producción)

### Contexto

El script Python (`migrate_companies.py`) con `--mode=local` usa un doble SSH tunnel que resulta
muy lento para migraciones grandes (~500 empresas cada 10 minutos). Para producción, usamos
**dblink** — una extensión de PostgreSQL que permite queries cross-database sin salir del motor.

Como `empliq_dev` y `empliq_prod` viven en el **mismo contenedor** (`musuq-postgres`), dblink
ejecuta todo internamente sin overhead de red.

### Prerequisitos

```sql
-- Ejecutar UNA vez en empliq_prod
CREATE EXTENSION IF NOT EXISTS dblink;
```

### Tabla _migration_log

La tabla `_migration_log` NO está en el schema Prisma. Se crea manualmente:

```sql
CREATE TABLE IF NOT EXISTS _migration_log (
  id            SERIAL PRIMARY KEY,
  ruc           VARCHAR(11) NOT NULL,
  source_db     VARCHAR(50) NOT NULL,
  target_db     VARCHAR(50) NOT NULL,
  company_id    UUID,
  status        VARCHAR(20) NOT NULL,
  error_message TEXT,
  migrated_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(ruc, target_db)
);
```

### Cómo ejecutar migración incremental

**Paso 1**: Copiar el script SQL al servidor

```bash
scp -i ~/.ssh/oracle_instance_key /tmp/dblink_migration.sql ubuntu@163.176.250.185:/tmp/
```

**Paso 2**: Ejecutar en background (sobrevive desconexión SSH)

```bash
ssh -i ~/.ssh/oracle_instance_key ubuntu@163.176.250.185 \
  "nohup sudo docker exec musuq-postgres psql -U postgres -d empliq_prod \
   -f /tmp/dblink_migration.sql > /tmp/migration_output.log 2>&1 & echo \$!"
```

**Paso 3**: Monitorear progreso

```bash
# Ver output del script
ssh -i ~/.ssh/oracle_instance_key ubuntu@163.176.250.185 \
  "cat /tmp/migration_output.log"

# Contar empresas en prod (durante migración, el count solo cambia al final por ser transaccional)
ssh -i ~/.ssh/oracle_instance_key ubuntu@163.176.250.185 \
  "sudo docker exec musuq-postgres psql -U postgres -d empliq_prod -t \
   -c 'SELECT count(*) FROM companies'"
```

### Script dblink_migration.sql

Ubicación: `/tmp/dblink_migration.sql` (se genera y copia al servidor)

El script:
1. Crea una función temporal `pg_temp.generate_slug()` para generar slugs URL-safe
2. Usa `dblink()` para leer `empliq_dev.companies_raw` donde `scrape_status = 'enriched'`
3. Para cada empresa:
   - Salta si ya existe en `_migration_log` con status 'success'
   - Salta si ya existe en `companies` por RUC
   - Extrae campos del JSONB (nombre, industria, ubicación, etc.)
   - Genera slug único (con fallback `empresa-{ruc}` si hay duplicados)
   - Construye metadata JSONB con todos los campos ricos del scraper
   - INSERT con `ON CONFLICT (ruc) DO NOTHING`
   - Registra éxito/fallo en `_migration_log`
4. Reporta resumen final (NOTICE)

**Características de incrementalidad:**
- **Idempotente**: seguro ejecutar múltiples veces
- **Incremental**: solo migra RUCs nuevos (no existentes en `_migration_log`)
- **Tolerante a fallos**: cada error se captura individualmente y se registra
- **Transaccional**: todo o nada dentro de un DO block

### Cuándo usar cada método

| Método | Cuándo | Velocidad |
|---|---|---|
| `migrate_companies.py --mode=local` | Migrar a **pre_prod local** | ~500/10min (SSH tunnel) |
| `migrate_companies.py --mode=oracle` | Desde el servidor Oracle (requiere pip3) | Rápido |
| `dblink_migration.sql` | Migrar a **prod** (same container) | **~25K en <2 min** |

---

## Estrategia Incremental

### Diaria (cuando hay nuevos datos del scraper)

```bash
# 1. Verificar cuántas empresas nuevas hay
ssh -i ~/.ssh/oracle_instance_key ubuntu@163.176.250.185 \
  "sudo docker exec musuq-postgres psql -U postgres -d empliq_dev -t -c \
   \"SELECT count(*) FROM companies_raw WHERE data->>'scrape_status' = 'enriched'\""

# 2. Si hay nuevas, ejecutar migración incremental
ssh -i ~/.ssh/oracle_instance_key ubuntu@163.176.250.185 \
  "sudo docker exec musuq-postgres psql -U postgres -d empliq_prod \
   -f /tmp/dblink_migration.sql"

# 3. Verificar resultado
ssh -i ~/.ssh/oracle_instance_key ubuntu@163.176.250.185 \
  "cat /tmp/migration_output.log | tail -10"
```

### Consideraciones para incrementalidad

1. **Schema changes**: Si Prisma schema cambia (ej: nueva columna en `companies`), actualizar
   TANTO el script `dblink_migration.sql` como `migrate_companies.py` para incluir el nuevo campo.
   Ejecutar `prisma migrate deploy` en empliq_prod ANTES de migrar datos.

2. **Datos de usuarios**: La tabla `companies` puede tener datos derivados de usuarios
   (reviews, salarios). La migración NUNCA toca esas tablas — solo inserta en `companies`.

3. **Slugs duplicados**: El script genera slugs desde el nombre comercial. Si hay colisión,
   agrega `-{ruc}` al slug. Esto es determinístico y estable entre ejecuciones.

4. **Metadata**: Cada empresa migrada lleva `metadata.migrated_at` con timestamp UTC.
   Esto permite auditar cuándo se migró cada empresa.

5. **Rollback**: Si una migración introduce datos incorrectos:
   ```sql
   -- Ver empresas migradas en una fecha específica
   SELECT company_id, ruc FROM _migration_log
   WHERE target_db = 'empliq_prod'
     AND migrated_at::date = '2026-02-27';

   -- Eliminar empresas de esa migración (si no tienen reviews/salarios)
   DELETE FROM companies WHERE id IN (
     SELECT company_id FROM _migration_log
     WHERE target_db = 'empliq_prod'
       AND migrated_at::date = '2026-02-27'
       AND company_id NOT IN (SELECT DISTINCT company_id FROM reviews)
       AND company_id NOT IN (SELECT DISTINCT company_id FROM salaries)
   );
   ```

6. **No re-migrar**: El script usa `ON CONFLICT (ruc) DO NOTHING` + chequeo de `_migration_log`.
   Las empresas existentes NUNCA se actualizan. Si necesitas actualizar datos de una empresa
   ya migrada, hazlo manualmente o crea un script de `UPDATE` específico.

---

## Historial de Migraciones

| Fecha | Target | Empresas | Método | Notas |
|---|---|---|---|---|
| 2026-02-24 | empliq_pre_prod | ~19,000+ | Python (SSH tunnel) | Primera migración completa |
| 2026-02-27 | empliq_prod | 24,860 | dblink (cross-DB) | Primera migración a producción. Schema alineado con Prisma (9 modelos). Trigger `handle_new_user()` actualizado. |

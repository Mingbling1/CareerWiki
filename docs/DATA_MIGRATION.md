# Migración de Datos — Empliq

> **Última actualización:** 24 de febrero de 2026

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
│  │ ~19,000+ empresas (crece diariamente)           │    │
│  │ Fuente: n8n workflows + scrapers + DatosPeru    │    │
│  │ Datos NO estructurados, raw de múltiples fuentes│    │
│  └──────────────────┬──────────────────────────────┘    │
│                     │                                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ DB: empliq_prod  (SOLO PRODUCCIÓN)              │    │
│  │ Schema: Prisma (idéntico a pre_prod)            │    │
│  │   NUNCA modificar directamente                │    │
│  │   Usa Prisma migrate para cambios de schema   │    │
│  │ Auth: GoTrue de producción (supabase.musuq.me)  │    │
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
| **empliq_prod** | Oracle Cloud | Producción. Misma estructura que pre_prod. Datos de usuarios. | Backend prod (api.musuq.me) + GoTrue prod |  **NUNCA** modificar directamente |

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
- config: `supabase.musuq.me`

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

## Historial de Migraciones

| Fecha | Target | Empresas | Notas |
|---|---|---|---|
| 2026-02-24 | empliq_pre_prod | ~19,000+ | Primera migración completa |

# Migración de Datos — Empliq

## Arquitectura de 3 Bases de Datos

```
┌─────────────────────────────────────────────┐
│  Oracle Cloud (163.176.250.185)             │
│  Container: musuq-postgres                  │
│  DB: empliq_dev                             │
│  Tabla: companies_raw (JSONB)               │
│  ~15,700+ empresas (crece diariamente)      │
│  Fuente: n8n workflows + scrapers           │
└──────────────────┬──────────────────────────┘
                   │
          [migrate_companies.py]
          (SSH tunnel + psycopg2)
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Local Docker (empliq-postgres)             │
│                                             │
│  ├── empliq_pre_prod (testing/staging)      │
│  │   → Validar datos antes de producción    │
│  │   → 15,589 empresas migradas             │
│  │                                          │
│  └── empliq (producción)                    │
│      → Datos validados, listos para la app  │
│      → Se publica cuando pre_prod está OK   │
└─────────────────────────────────────────────┘
```

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

### Migrar a producción
```bash
python3 scripts/migrate_companies.py --target=empliq
```

### Solo actualizar logos
```bash
python3 scripts/migrate_companies.py --update-logos
```

### Migrar las últimas N empresas
```bash
python3 scripts/migrate_companies.py --limit=100
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
| `data->>'industry'` | `industry` |
| `data->>'nro_trabajadores'` | `employee_count` |
| `data->>'departamento'` | `location` |
| `data->>'website'` | `website` |
| `logo_bucket_url` | `logo_url` |
| `data->>'founded_year'` | `founded_year` |
| `{razon_social, source, migrated_at}` | `metadata` (JSONB) |

## Flujo de Trabajo Diario

1. **Oracle crece**: n8n workflows y scrapers enriquecen `empliq_dev` diariamente
2. **Migrar a pre_prod**: `python3 scripts/migrate_companies.py` (incremental, solo nuevos RUCs)
3. **Validar**: Verificar la app con datos de `empliq_pre_prod`
4. **Producción**: `python3 scripts/migrate_companies.py --target=empliq`
5. **Verificar**: `python3 scripts/migrate_companies.py --stats`

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

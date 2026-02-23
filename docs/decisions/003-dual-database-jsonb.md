# ADR-003: Dual Database — JSONB para Scraper, Prisma para App

**Fecha:** Enero 2026
**Estado:** Aceptado

## Contexto

Los datos del scraper son irregulares — algunas empresas tienen logo, ejecutivos, historial; otras solo RUC básico. La app de producción necesita datos estructurados con relaciones.

## Opciones Evaluadas

1. **Una sola DB con 40+ columnas nullable** — Schema frágil, muchos NULLs
2. **Dual DB: `empliq_dev` (JSONB) + `empliq` (Prisma)** — Cada una optimizada para su uso
3. **MongoDB para scraper** — Añade otra tecnología al stack

## Decisión

Dos bases de datos PostgreSQL:

| DB | Tabla | Propósito |
|----|-------|-----------|
| `empliq_dev` | `companies_raw` | Datos crudos del scraper (JSONB). Todo va al campo `data`. |
| `empliq` | Modelos Prisma | App de producción. Datos estructurados con relaciones. |

```sql
-- empliq_dev
INSERT INTO companies_raw (ruc, razon_social, data, source, updated_at)
VALUES ($1, $2, $3::jsonb, 'n8n_datosperu_v6', NOW())
ON CONFLICT (ruc) DO UPDATE ...
```

## Consecuencias

- **Positivo:** El scraper puede guardar cualquier estructura sin cambiar schema
- **Positivo:** La app de producción tiene un schema limpio y validado por Prisma
- **Positivo:** Pipeline ETL para extraer de `companies_raw` → `companies`
- **Negativo:** Mantener sync entre ambas DBs requiere scripts
- **Negativo:** Un paso extra para mover datos al entorno de producción

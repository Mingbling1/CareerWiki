-- ============================================
-- EMPLIQ — Fast Full Migration via dblink
-- Runs inside empliq_prod on musuq-postgres
-- Both DBs in same PostgreSQL cluster = instant cross-DB
-- Expected: ~85K companies in <5 minutes
-- ============================================

\timing on

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS dblink;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Helper: generate slug from company name (matches Python logic)
CREATE OR REPLACE FUNCTION pg_temp.generate_slug(input_name TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  result := lower(trim(COALESCE(input_name, '')));
  result := translate(result,
    'áàäâéèëêíìïîóòöôúùüûñÁÀÄÂÉÈËÊÍÌÏÎÓÒÖÔÚÙÜÛÑ',
    'aaaaeeeeiiiioooouuuunaaaaeeeeiiiioooouuuun');
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  result := trim(both '-' from result);
  IF result = '' OR result IS NULL THEN
    result := 'empresa';
  END IF;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. Full reset (safe: 0 user data in prod)
DO $$
BEGIN
  RAISE NOTICE '=== Starting full reset ===';
  DELETE FROM benefits;
  DELETE FROM salaries;
  DELETE FROM reviews;
  DELETE FROM interviews;
  DELETE FROM positions;
  DELETE FROM companies;
  DELETE FROM _migration_log WHERE target_db = 'empliq_prod';
  RAISE NOTICE '=== Reset complete ===';
END $$;

-- 4. Migrate all enriched companies via dblink
DO $$
DECLARE
  v_inserted INT;
  v_start TIMESTAMP := clock_timestamp();
BEGIN
  RAISE NOTICE '=== Starting migration via dblink ===';

  WITH source AS (
    SELECT *
    FROM dblink(
      'dbname=empliq_dev user=postgres password=postgres123',
      $q$
        SELECT
          ruc,
          razon_social,
          COALESCE(logo_bucket_url, '') as logo_bucket_url,
          data
        FROM companies_raw
        WHERE data->>'scrape_status' = 'enriched'
        ORDER BY (CASE WHEN (data->>'nro_trabajadores') ~ '^\d+$' THEN (data->>'nro_trabajadores')::int ELSE 0 END) DESC
      $q$
    ) AS t(ruc varchar, razon_social varchar, logo_bucket_url text, data jsonb)
  ),
  transformed AS (
    SELECT
      uuid_generate_v4() as id,
      ruc,
      COALESCE(NULLIF(trim(data->>'name'), ''), trim(razon_social), 'Sin Nombre') as name,
      pg_temp.generate_slug(
        COALESCE(NULLIF(trim(data->>'name'), ''), trim(razon_social), 'Sin Nombre')
      ) as base_slug,
      NULLIF(trim(data->>'description'), '') as description,
      COALESCE(
        NULLIF(trim(data->>'sector_economico'), ''),
        NULLIF(trim(data->>'industry'), '')
      ) as industry,
      CASE
        WHEN (data->>'nro_trabajadores') ~ '^\d+$'
        THEN (data->>'nro_trabajadores')::int
        ELSE NULL
      END as employee_count,
      -- Location: distrito, provincia, departamento
      NULLIF(
        array_to_string(
          ARRAY(
            SELECT v FROM unnest(ARRAY[
              NULLIF(NULLIF(trim(data->>'distrito'), ''), '-'),
              NULLIF(NULLIF(trim(data->>'provincia'), ''), '-'),
              NULLIF(NULLIF(trim(data->>'departamento'), ''), '-')
            ]) AS v WHERE v IS NOT NULL
          ), ', '
        ), ''
      ) as location,
      NULLIF(trim(data->>'website'), '') as website,
      NULLIF(trim(logo_bucket_url), '') as logo_url,
      -- Founded year from fecha_inicio (DD/MM/YYYY)
      CASE
        WHEN data->>'fecha_inicio' ~ '^\d{2}/\d{2}/\d{4}$'
        THEN (split_part(data->>'fecha_inicio', '/', 3))::int
        WHEN (data->>'founded_year') ~ '^\d{4}$'
        THEN (data->>'founded_year')::int
        ELSE NULL
      END as founded_year,
      false as is_verified,
      -- Rich metadata
      jsonb_strip_nulls(jsonb_build_object(
        'razon_social', razon_social,
        'source', 'empliq_dev',
        'migrated_at', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'direccion', NULLIF(trim(data->>'direccion'), ''),
        'distrito', NULLIF(NULLIF(trim(data->>'distrito'), ''), '-'),
        'provincia', NULLIF(NULLIF(trim(data->>'provincia'), ''), '-'),
        'departamento', NULLIF(NULLIF(trim(data->>'departamento'), ''), '-'),
        'sector_economico', NULLIF(trim(data->>'sector_economico'), ''),
        'actividad_ciiu', NULLIF(trim(data->>'actividad_ciiu'), ''),
        'tipo_empresa', NULLIF(trim(data->>'tipo_empresa'), ''),
        'condicion', NULLIF(trim(data->>'condicion'), ''),
        'estado', NULLIF(trim(data->>'estado'), ''),
        'fecha_inicio', NULLIF(trim(data->>'fecha_inicio'), ''),
        'fecha_inscripcion', NULLIF(trim(data->>'fecha_inscripcion'), ''),
        'telefonos', data->'telefonos',
        'ejecutivos', data->'ejecutivos',
        'historial_trabajadores', data->'historial_trabajadores',
        'historial_condiciones', data->'historial_condiciones',
        'historial_direcciones', data->'historial_direcciones',
        'establecimientos_anexos', data->'establecimientos_anexos',
        'comercio_exterior', NULLIF(trim(data->>'comercio_exterior'), ''),
        'referencia', NULLIF(trim(data->>'referencia'), ''),
        'proveedor_estado', CASE
          WHEN data->>'proveedor_estado' IN ('true', 'True', '1') THEN 'true'::jsonb
          WHEN data->>'proveedor_estado' IN ('false', 'False', '0') THEN 'false'::jsonb
          ELSE NULL
        END,
        'tier', NULLIF(trim(data->>'tier'), '')
      )) as metadata,
      NOW() as created_at,
      NOW() as updated_at
    FROM source
  ),
  -- Deduplicate slugs: first company (most employees) gets clean slug, rest get slug-ruc
  slugged AS (
    SELECT *,
      ROW_NUMBER() OVER (PARTITION BY base_slug ORDER BY employee_count DESC NULLS LAST) as rn
    FROM transformed
  )
  INSERT INTO companies (
    id, ruc, name, slug, description, industry, employee_count,
    location, website, logo_url, founded_year, is_verified,
    metadata, created_at, updated_at
  )
  SELECT
    id, ruc, name,
    CASE WHEN rn = 1 THEN base_slug ELSE base_slug || '-' || ruc END as slug,
    description, industry, employee_count, location, website,
    logo_url, founded_year, is_verified, metadata, created_at, updated_at
  FROM slugged;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  RAISE NOTICE '=== Migration complete: % companies inserted in % ===',
    v_inserted,
    (clock_timestamp() - v_start)::text;
END $$;

-- 5. Show results
SELECT
  count(*) as total,
  count(*) FILTER (WHERE logo_url IS NOT NULL AND logo_url != '') as with_logo,
  count(*) FILTER (WHERE employee_count IS NOT NULL) as with_employees,
  count(*) FILTER (WHERE description IS NOT NULL) as with_description,
  min(employee_count) as min_employees,
  max(employee_count) as max_employees
FROM companies;

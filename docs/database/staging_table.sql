-- ============================================
-- EMPLIQ - Raw Companies Table (Scraper Data)
-- Base de datos: empliq_dev
-- Para n8n workflow v5
-- ============================================
--
-- Estrategia: TODO en JSONB
-- Los datos del scraper vienen con campos variables
-- (algunas empresas tienen logo, otras no; unas tienen
-- ejecutivos, otras solo RUC). En vez de 40+ columnas
-- con NULLs, guardamos todo en un blob JSONB flexible.
--
-- Cuando migremos a la app (tabla companies),
-- extraemos lo que necesitamos con queries JSONB.
-- ============================================

-- NOTA: Esta tabla ya existe en empliq_dev (creada manualmente).
-- Este archivo es referencia/documentación.

CREATE TABLE IF NOT EXISTS public.companies_raw (
    id SERIAL PRIMARY KEY,
    ruc VARCHAR(11) UNIQUE NOT NULL,
    razon_social VARCHAR(500),
    data JSONB NOT NULL DEFAULT '{}',
    source VARCHAR(50) DEFAULT 'n8n_scraper',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_companies_raw_ruc ON public.companies_raw(ruc);
CREATE INDEX IF NOT EXISTS idx_companies_raw_data ON public.companies_raw USING gin(data);

-- ============================================
-- Estructura del campo `data` (JSONB)
-- ============================================
--
-- Todo va dentro de `data`. Ejemplo completo:
--
-- {
--   // --- Datos del CSV/RUC ---
--   "estado": "ACTIVO",
--   "condicion": "HABIDO",
--   "tipo_empresa": "SOCIEDAD ANONIMA CERRADA",
--   "actividad_ciiu": "6419",
--   "nro_trabajadores": 26500,
--   "departamento": "LIMA",
--   "provincia": "LIMA",
--   "distrito": "LA MOLINA",
--   "tier": "tier1",
--
--   // --- Datos de búsqueda web ---
--   "website": "https://www.viabcp.com",
--   "website_score": 25,
--   "search_strategy": "ddg_http",
--
--   // --- Datos del scraper (website) ---
--   "name": "Banco de Crédito del Perú",
--   "description": "BCP es el banco más grande del Perú...",
--   "history": "Fundado en 1889...",
--   "industry": "Banca y Finanzas",
--   "culture": null,
--   "mission": "Transformar planes en realidad...",
--   "vision": "Ser el banco líder...",
--   "values_list": ["Integridad", "Innovación"],
--   "benefits": ["Seguro de salud", "Bonos"],
--   "founded_year": 1889,
--   "headquarters": "Calle Centenario 156, La Molina, Lima",
--   "phones": ["+51 1 311 9898"],
--   "emails": ["contacto@bcp.com.pe"],
--   "social_links": { "linkedin": "...", "facebook": "..." },
--   "logo_url": "https://www.datosperu.org/top300/banco-de-credito.jpg",
--   "pages_scraped": ["https://www.viabcp.com/", "https://www.viabcp.com/nosotros"],
--   "fields_extracted": 15,
--   "scrape_duration_ms": 4500,
--
--   // --- Datos de DatosPeru (raw completo) ---
--   "datos_peru": { ... respuesta completa de /enrich/datosperu ... },
--
--   // --- Metadata del scraping ---
--   "scrape_status": "scraped",
--   "scrape_error": null,
--   "scraped_at": "2026-02-14T20:00:00.000Z"
-- }
--
-- ============================================
-- Queries útiles sobre JSONB
-- ============================================
--
-- Empresas con website:
--   SELECT ruc, data->>'website' FROM companies_raw WHERE data->>'website' IS NOT NULL;
--
-- Empresas tier1:
--   SELECT ruc, data->>'name' FROM companies_raw WHERE data->>'tier' = 'tier1';
--
-- Empresas con logo:
--   SELECT ruc, data->>'logo_url' FROM companies_raw WHERE data->>'logo_url' IS NOT NULL;
--
-- Contar por status:
--   SELECT data->>'scrape_status' AS status, count(*) FROM companies_raw GROUP BY 1;
--
-- Buscar por nombre (case-insensitive):
--   SELECT * FROM companies_raw WHERE razon_social ILIKE '%banco%';
--
-- Extraer ejecutivos de DatosPeru:
--   SELECT ruc, jsonb_array_elements(data->'datos_peru'->'ejecutivos') FROM companies_raw;
--
-- Top empresas por nro_trabajadores:
--   SELECT ruc, razon_social, (data->>'nro_trabajadores')::int AS trab
--   FROM companies_raw ORDER BY trab DESC NULLS LAST LIMIT 20;

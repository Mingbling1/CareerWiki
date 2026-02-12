-- ============================================
-- EMPLIQ - Staging Table for Scraped Companies
-- Para n8n workflow
-- ============================================

-- Tabla de staging para empresas scrapeadas
CREATE TABLE IF NOT EXISTS public.companies_staging (
    id SERIAL PRIMARY KEY,
    
    -- Datos del RUC
    ruc VARCHAR(11) UNIQUE NOT NULL,
    estado VARCHAR(50),
    condicion VARCHAR(50),
    tipo_empresa VARCHAR(100),
    actividad_ciiu VARCHAR(255),
    nro_trabajadores INTEGER,
    departamento VARCHAR(100),
    provincia VARCHAR(100),
    distrito VARCHAR(100),
    
    -- Datos scrapeados
    website VARCHAR(500),
    website_title VARCHAR(255),
    website_snippet TEXT,
    
    -- Datos extraídos por AI
    name VARCHAR(255),
    description TEXT,
    industry VARCHAR(100),
    culture TEXT,
    benefits JSONB DEFAULT '[]',
    founded_year INTEGER,
    social_links JSONB DEFAULT '{}',
    logo_url VARCHAR(500),
    
    -- Metadata
    tier VARCHAR(10), -- 'tier1', 'tier2', 'tier3'
    scrape_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'scraped', 'failed', 'migrated'
    scrape_error TEXT,
    raw_ai_response JSONB,
    
    -- Control de migración
    migrated_to_app BOOLEAN DEFAULT FALSE,
    migrated_at TIMESTAMPTZ,
    app_company_id UUID, -- ID en la tabla companies de la app
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    scraped_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_staging_ruc ON public.companies_staging(ruc);
CREATE INDEX IF NOT EXISTS idx_staging_status ON public.companies_staging(scrape_status);
CREATE INDEX IF NOT EXISTS idx_staging_migrated ON public.companies_staging(migrated_to_app);
CREATE INDEX IF NOT EXISTS idx_staging_tier ON public.companies_staging(tier);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_staging_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_staging_updated_at ON public.companies_staging;
CREATE TRIGGER trigger_staging_updated_at
    BEFORE UPDATE ON public.companies_staging
    FOR EACH ROW
    EXECUTE FUNCTION update_staging_updated_at();

-- Comentario de la tabla
COMMENT ON TABLE public.companies_staging IS 'Tabla de staging para empresas scrapeadas por n8n antes de migrar a la app';

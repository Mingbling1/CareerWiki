-- ============================================
-- EMPLIQ - Database Initialization
-- Runs on first Docker volume creation only.
-- Prisma manages the actual schema via `prisma db push`.
-- ============================================

-- Enable UUID extension for the default empliq DB
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Create empliq_pre_prod database (testing/staging)
-- ============================================
CREATE DATABASE empliq_pre_prod
    WITH OWNER = empliq
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8';

-- Enable UUID extension in empliq_pre_prod
\c empliq_pre_prod
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Switch back to empliq
\c empliq

-- ============================================
-- Migration tracking table
-- Tracks which companies have been migrated
-- from empliq_dev (Oracle) to this DB
-- ============================================
CREATE TABLE IF NOT EXISTS _migration_log (
    id SERIAL PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL,
    source_db TEXT NOT NULL DEFAULT 'empliq_dev',
    target_db TEXT NOT NULL,
    company_id UUID,
    migrated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'success',
    error_message TEXT,
    UNIQUE(ruc, target_db)
);

CREATE INDEX IF NOT EXISTS idx_migration_log_ruc ON _migration_log(ruc);
CREATE INDEX IF NOT EXISTS idx_migration_log_status ON _migration_log(status);

COMMENT ON TABLE _migration_log IS 'Tracks incremental data migration from empliq_dev (Oracle) to empliq/empliq_pre_prod. Each row = one company migrated.';

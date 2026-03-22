-- ============================================
-- EMPLIQ - Local Database Initialization
--
-- Runs on first Docker volume creation only.
-- Sets up Supabase roles for local GoTrue auth.
-- Prisma manages the `public` schema via `prisma db push`.
-- ============================================

-- ==========================================
-- 1. Extensions
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 2. Supabase Roles (for GoTrue / Kong / Studio)
-- ==========================================

-- postgres: GoTrue migrations expect this role to exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
    CREATE ROLE postgres WITH SUPERUSER LOGIN PASSWORD 'postgres';
  END IF;
END $$;

-- supabase_admin: used by Studio + postgres-meta
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin LOGIN PASSWORD 'supabase_admin_password' SUPERUSER;
  END IF;
END $$;

-- supabase_auth_admin: used by GoTrue to manage auth schema
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin LOGIN PASSWORD 'supabase_auth_admin_password' NOINHERIT;
  END IF;
END $$;
ALTER ROLE supabase_auth_admin SET search_path TO auth, public;

-- anon: unauthenticated API requests
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
END $$;

-- authenticated: logged-in users
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END $$;

-- service_role: admin-level API access
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END $$;

-- authenticator: GoTrue connects as this, then SET ROLE to anon/authenticated
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator LOGIN PASSWORD 'authenticator_password' NOINHERIT;
  END IF;
END $$;

-- Grant role switching
GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;
GRANT supabase_auth_admin TO authenticator;

-- Grant access for GoTrue
GRANT ALL ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

-- ==========================================
-- 3. Auth Schema (GoTrue auto-creates this, we pre-grant)
-- ==========================================
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;

-- ==========================================
-- 4. Application User Config
-- ==========================================
ALTER ROLE empliq WITH SUPERUSER;
ALTER ROLE empliq SET search_path TO public;

-- ==========================================
-- 5. Migration Tracking Table
-- ==========================================
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

COMMENT ON TABLE _migration_log IS 'Tracks data migration from empliq_dev (Oracle). Prisma manages app schema.';

-- ==========================================
-- 6. Profile Trigger (auto-create profile on signup)
--    GoTrue inserts into auth.users, this trigger
--    creates matching profile in public.profiles.
--    IMPORTANT: Columns must match Prisma schema exactly:
--      - "name" (NOT "full_name")
--      - "updated_at" is required (NOT NULL)
--      - No "provider" column (removed from schema)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.profiles (id, email, name, avatar_url, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NOW()
    );
    RETURN NEW;
END;
$function$;

-- NOTE: The trigger ON auth.users is created AFTER GoTrue initializes.
-- GoTrue creates auth.users on first boot (52 internal migrations).
-- After GoTrue starts and creates auth.users, run:
--   CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 7. Create empliq_pre_prod Database
--    Local dev environment uses this database.
--    GoTrue + API both connect here for local dev.
--    Prisma manages the public schema via `prisma db push`.
-- ==========================================

-- Note: In PostgreSQL Docker entrypoint, init scripts run against POSTGRES_DB.
-- We create empliq_pre_prod as a separate database for staging/testing.
-- Roles are cluster-wide, so they already exist from above.

-- Create the database (will fail silently if it already exists)
SELECT 'CREATE DATABASE empliq_pre_prod OWNER empliq'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'empliq_pre_prod')\gexec

-- Connect to empliq_pre_prod and set up schemas
\connect empliq_pre_prod

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;

GRANT ALL ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

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

COMMENT ON TABLE _migration_log IS 'Tracks data migration from empliq_dev (Oracle). Prisma manages app schema.';

-- Profile trigger for empliq_pre_prod (same function as main DB)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.profiles (id, email, name, avatar_url, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NOW()
    );
    RETURN NEW;
END;
$function$;

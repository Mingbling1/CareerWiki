-- ============================================
-- EMPLIQ - Database Initialization
-- Based on Supabase Self-Hosting Guide:
-- https://supabase.com/docs/guides/self-hosting/docker
--
-- Runs on first Docker volume creation only.
-- GoTrue (Supabase Auth) auto-creates tables in `auth` schema.
-- Prisma manages the `public` schema via `prisma db push`.
-- ============================================

-- ==========================================
-- 1. Extensions
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 2. Supabase Roles
-- Required by GoTrue and PostgREST/API
-- Ref: https://supabase.com/docs/guides/database/postgres/roles#supabase-roles
-- ==========================================

-- Anonymous role (maps to "anon" claim in JWTs)
CREATE ROLE anon NOLOGIN NOINHERIT;

-- Authenticated role (maps to "authenticated" claim in JWTs)
CREATE ROLE authenticated NOLOGIN NOINHERIT;

-- Service role (bypasses RLS, backend-only)
CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;

-- Auth admin (GoTrue connects as this role to manage auth.* tables)
CREATE ROLE supabase_auth_admin
  NOINHERIT CREATEROLE LOGIN
  PASSWORD 'supabase_auth_admin_password';

-- Give superuser so GoTrue migrations can create types, triggers, etc.
ALTER ROLE supabase_auth_admin WITH SUPERUSER;

-- Supabase Admin (Studio / postgres-meta connect with this role)
CREATE ROLE supabase_admin WITH SUPERUSER LOGIN PASSWORD 'empliq_dev_password';

-- Authenticator (PostgREST role, can switch to any of the above)
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'authenticator_password';
GRANT anon              TO authenticator;
GRANT authenticated     TO authenticator;
GRANT service_role      TO authenticator;
GRANT supabase_auth_admin TO authenticator;

-- ==========================================
-- 3. Auth Schema (GoTrue-managed)
-- ==========================================
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;

GRANT ALL PRIVILEGES ON SCHEMA auth TO supabase_auth_admin;
GRANT USAGE ON SCHEMA auth TO authenticated, anon, service_role;

-- GoTrue expects search_path = 'auth' so its unqualified objects
-- (types, functions) are created inside the auth schema.
ALTER ROLE supabase_auth_admin SET search_path = 'auth';

-- ==========================================
-- 4. Application User Config
-- ==========================================
-- Keep empliq as superuser for Prisma migrations
ALTER ROLE empliq WITH SUPERUSER;
-- empliq should default to public schema for Prisma
ALTER ROLE empliq SET search_path TO public;

-- ==========================================
-- 5. Empliq Application Tables
-- (Minimal bootstrap — Prisma manages the real schema)
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

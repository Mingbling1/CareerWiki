-- ============================================
-- EMPLIQ - Database Schema (Local PostgreSQL)
-- Better Auth + App Tables
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BETTER AUTH TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    image TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    access_token_expires_at TIMESTAMPTZ,
    refresh_token_expires_at TIMESTAMPTZ,
    scope TEXT,
    password TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);

CREATE TABLE IF NOT EXISTS verifications (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPANIES
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    industry TEXT,
    size TEXT,
    location TEXT,
    website TEXT,
    logo_url TEXT,
    culture TEXT,
    benefits TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);

-- ============================================
-- DEPARTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_company ON departments(company_id);

-- ============================================
-- POSITIONS (Puestos)
-- ============================================
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT,
    requirements TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_positions_company ON positions(company_id);
CREATE INDEX IF NOT EXISTS idx_positions_department ON positions(department_id);

-- ============================================
-- ORG_NODES (Nodos del organigrama)
-- ============================================
CREATE TABLE IF NOT EXISTS org_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES org_nodes(id) ON DELETE SET NULL,
    node_id TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT DEFAULT 'default',
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_org_nodes_company ON org_nodes(company_id);

-- ============================================
-- ORG_EDGES (Conexiones del organigrama)
-- ============================================
CREATE TABLE IF NOT EXISTS org_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    edge_id TEXT NOT NULL,
    source_node_id TEXT NOT NULL,
    target_node_id TEXT NOT NULL,
    type TEXT DEFAULT 'default',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, edge_id)
);

CREATE INDEX IF NOT EXISTS idx_org_edges_company ON org_edges(company_id);

-- ============================================
-- SALARIES (Salarios - anónimos públicamente)
-- ============================================
CREATE TABLE IF NOT EXISTS salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    period TEXT DEFAULT 'monthly',
    years_experience INT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salaries_position ON salaries(position_id);

-- ============================================
-- COMMENTS (Comentarios - anónimos públicamente)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    pros TEXT,
    cons TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_position ON comments(position_id);

-- ============================================
-- INTERVIEWS (Entrevistas - anónimas públicamente)
-- ============================================
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    process TEXT,
    questions TEXT[],
    difficulty TEXT,
    duration TEXT,
    result TEXT,
    tips TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_position ON interviews(position_id);

-- ============================================
-- SEED DATA
-- ============================================

-- Usuario de prueba (para desarrollo)
INSERT INTO users (id, name, email, email_verified, role) VALUES
    ('demo-user-001', 'Usuario Demo', 'demo@empliq.com', true, 'user')
ON CONFLICT (id) DO NOTHING;

-- Cuenta de prueba (email/password - password: demo1234)
INSERT INTO accounts (id, user_id, account_id, provider_id, password) VALUES
    ('demo-account-001', 'demo-user-001', 'demo@empliq.com', 'credential', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.J8H7.6Gm7ySJYKh3Vy')
ON CONFLICT (id) DO NOTHING;

-- Empresas de ejemplo
INSERT INTO companies (id, name, slug, description, industry, size, location, website, culture, benefits) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'TechCorp México', 'techcorp-mexico', 'Empresa líder en desarrollo de software empresarial', 'Tecnología', '201-500', 'Ciudad de México, México', 'https://techcorp.mx', 'Cultura de innovación y aprendizaje continuo', ARRAY['Seguro médico', 'Home office', 'Bonos trimestrales', 'Capacitación']),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Finanzas Plus', 'finanzas-plus', 'Servicios financieros digitales para PyMEs', 'Finanzas', '51-200', 'Monterrey, México', 'https://finanzasplus.com', 'Enfoque en resultados y trabajo en equipo', ARRAY['Seguro de vida', 'Vales de despensa', 'Gimnasio']),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'RetailMax', 'retailmax', 'Cadena de tiendas departamentales', 'Retail', '1001+', 'Guadalajara, México', 'https://retailmax.mx', 'Servicio al cliente como prioridad', ARRAY['Descuentos en tiendas', 'Seguro médico', 'Fondo de ahorro'])
ON CONFLICT (id) DO NOTHING;

-- Departamentos
INSERT INTO departments (id, company_id, name, description) VALUES
    ('d1111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Ingeniería', 'Desarrollo de software y arquitectura'),
    ('d2222222-2222-2222-2222-222222222222'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Producto', 'Gestión de producto y diseño'),
    ('d3333333-3333-3333-3333-333333333333'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Recursos Humanos', 'Talento y cultura organizacional'),
    ('d4444444-4444-4444-4444-444444444444'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Tecnología', 'Desarrollo y mantenimiento de sistemas'),
    ('d5555555-5555-5555-5555-555555555555'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Operaciones', 'Procesos y atención al cliente')
ON CONFLICT (id) DO NOTHING;

-- Posiciones
INSERT INTO positions (id, company_id, department_id, title, description, level, requirements) VALUES
    ('01111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, 'Senior Software Engineer', 'Desarrollo de aplicaciones backend con Node.js y PostgreSQL', 'senior', ARRAY['5+ años experiencia', 'Node.js', 'PostgreSQL', 'AWS']),
    ('02222222-2222-2222-2222-222222222222'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, 'Frontend Developer', 'Desarrollo de interfaces con React y TypeScript', 'mid', ARRAY['3+ años experiencia', 'React', 'TypeScript', 'CSS']),
    ('03333333-3333-3333-3333-333333333333'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, 'Product Manager', 'Definición de roadmap y priorización de features', 'senior', ARRAY['4+ años experiencia', 'Metodologías ágiles', 'Análisis de datos']),
    ('04444444-4444-4444-4444-444444444444'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, 'Engineering Manager', 'Liderazgo del equipo de ingeniería', 'manager', ARRAY['7+ años experiencia', 'Gestión de equipos', 'Arquitectura de software']),
    ('05555555-5555-5555-5555-555555555555'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, 'Full Stack Developer', 'Desarrollo completo de aplicaciones fintech', 'mid', ARRAY['3+ años experiencia', 'React', 'Python', 'PostgreSQL'])
ON CONFLICT (id) DO NOTHING;

-- Nodos del organigrama para TechCorp
INSERT INTO org_nodes (id, company_id, position_id, node_id, label, type, position_x, position_y) VALUES
    ('a1111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '04444444-4444-4444-4444-444444444444'::uuid, 'node-1', 'Engineering Manager', 'default', 400, 100),
    ('a2222222-2222-2222-2222-222222222222'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '01111111-1111-1111-1111-111111111111'::uuid, 'node-2', 'Senior Software Engineer', 'default', 200, 250),
    ('a3333333-3333-3333-3333-333333333333'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '02222222-2222-2222-2222-222222222222'::uuid, 'node-3', 'Frontend Developer', 'default', 400, 250),
    ('a4444444-4444-4444-4444-444444444444'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '03333333-3333-3333-3333-333333333333'::uuid, 'node-4', 'Product Manager', 'default', 600, 250)
ON CONFLICT (company_id, node_id) DO NOTHING;

-- Edges del organigrama
INSERT INTO org_edges (id, company_id, edge_id, source_node_id, target_node_id) VALUES
    ('e1111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'edge-1-2', 'node-1', 'node-2'),
    ('e2222222-2222-2222-2222-222222222222'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'edge-1-3', 'node-1', 'node-3'),
    ('e3333333-3333-3333-3333-333333333333'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'edge-1-4', 'node-1', 'node-4')
ON CONFLICT (company_id, edge_id) DO NOTHING;

-- Salarios de ejemplo
INSERT INTO salaries (position_id, user_id, amount, currency, period, years_experience) VALUES
    ('01111111-1111-1111-1111-111111111111'::uuid, 'demo-user-001', 85000, 'MXN', 'monthly', 6),
    ('01111111-1111-1111-1111-111111111111'::uuid, 'demo-user-001', 78000, 'MXN', 'monthly', 5),
    ('01111111-1111-1111-1111-111111111111'::uuid, 'demo-user-001', 92000, 'MXN', 'monthly', 7),
    ('02222222-2222-2222-2222-222222222222'::uuid, 'demo-user-001', 45000, 'MXN', 'monthly', 3),
    ('02222222-2222-2222-2222-222222222222'::uuid, 'demo-user-001', 52000, 'MXN', 'monthly', 4),
    ('03333333-3333-3333-3333-333333333333'::uuid, 'demo-user-001', 75000, 'MXN', 'monthly', 5),
    ('04444444-4444-4444-4444-444444444444'::uuid, 'demo-user-001', 120000, 'MXN', 'monthly', 8);

-- Comentarios de ejemplo
INSERT INTO comments (position_id, user_id, content, rating, pros, cons) VALUES
    ('01111111-1111-1111-1111-111111111111'::uuid, 'demo-user-001', 'Excelente ambiente de trabajo y mucho aprendizaje técnico.', 5, 'Tecnologías modernas, equipo colaborativo', 'A veces hay mucha presión en los releases'),
    ('01111111-1111-1111-1111-111111111111'::uuid, 'demo-user-001', 'Buenos beneficios y flexibilidad de horario.', 4, 'Home office, buen salario', 'Reuniones excesivas'),
    ('02222222-2222-2222-2222-222222222222'::uuid, 'demo-user-001', 'Buen lugar para empezar carrera en frontend.', 4, 'Mentoring, stack moderno', 'Salario podría ser mejor'),
    ('03333333-3333-3333-3333-333333333333'::uuid, 'demo-user-001', 'Rol con mucha autonomía y responsabilidad.', 5, 'Impacto en el producto, buen equipo', 'Mucho trabajo');

-- Entrevistas de ejemplo
INSERT INTO interviews (position_id, user_id, process, questions, difficulty, duration, result, tips) VALUES
    ('01111111-1111-1111-1111-111111111111'::uuid, 'demo-user-001', '3 rondas: técnica, system design, cultural', ARRAY['Diseña un sistema de caché distribuido', 'Explica tu experiencia con microservicios', 'Cuéntame un conflicto que hayas resuelto'], 'Media-Alta', '2 semanas', 'Oferta aceptada', 'Prepara casos de system design y conoce bien los principios SOLID'),
    ('02222222-2222-2222-2222-222222222222'::uuid, 'demo-user-001', '2 rondas: código en vivo, cultural', ARRAY['Implementa un componente de autocompletado', 'Cómo optimizarías el rendimiento de una app React'], 'Media', '1 semana', 'Oferta recibida', 'Practica problemas de LeetCode nivel medio y conoce bien React hooks');

SELECT 'Database initialized with Better Auth tables and seed data!' as status;

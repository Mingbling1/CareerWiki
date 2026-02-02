-- ============================================
-- EMPLIQ - Database Schema
-- PostgreSQL (Supabase)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    provider TEXT, -- 'google' | 'linkedin_oidc'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_app_meta_data->>'provider'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- COMPANIES
-- ============================================
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    industry TEXT,
    size TEXT, -- '1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'
    location TEXT,
    website TEXT,
    logo_url TEXT,
    culture TEXT,
    benefits TEXT[], -- Array of benefit strings
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON public.companies(slug);
CREATE INDEX idx_companies_industry ON public.companies(industry);

-- RLS for companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies are viewable by authenticated users"
    ON public.companies FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- DEPARTMENTS
-- ============================================
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_departments_company ON public.departments(company_id);

-- RLS for departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Departments are viewable by authenticated users"
    ON public.departments FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- POSITIONS (Puestos)
-- ============================================
CREATE TABLE public.positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT, -- 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c-level'
    requirements TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_positions_company ON public.positions(company_id);
CREATE INDEX idx_positions_department ON public.positions(department_id);

-- RLS for positions
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Positions are viewable by authenticated users"
    ON public.positions FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- ORG_NODES (Organigrama - ReactFlow nodes)
-- ============================================
CREATE TABLE public.org_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES public.org_nodes(id) ON DELETE SET NULL,
    node_id TEXT NOT NULL, -- ReactFlow node ID
    label TEXT NOT NULL,
    type TEXT DEFAULT 'default', -- ReactFlow node type
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, node_id)
);

CREATE INDEX idx_org_nodes_company ON public.org_nodes(company_id);
CREATE INDEX idx_org_nodes_parent ON public.org_nodes(parent_id);

-- RLS for org_nodes
ALTER TABLE public.org_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org nodes are viewable by authenticated users"
    ON public.org_nodes FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- ORG_EDGES (Organigrama - ReactFlow edges)
-- ============================================
CREATE TABLE public.org_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    edge_id TEXT NOT NULL, -- ReactFlow edge ID
    source_node_id TEXT NOT NULL,
    target_node_id TEXT NOT NULL,
    type TEXT DEFAULT 'smoothstep',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, edge_id)
);

CREATE INDEX idx_org_edges_company ON public.org_edges(company_id);

-- RLS for org_edges
ALTER TABLE public.org_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org edges are viewable by authenticated users"
    ON public.org_edges FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- SALARIES (Reportes de salario - anónimos)
-- ============================================
CREATE TABLE public.salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL, -- Guardado pero NO mostrado
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'PEN', -- 'PEN', 'USD', etc.
    frequency TEXT DEFAULT 'monthly', -- 'monthly', 'yearly'
    experience_years INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    additional_comp JSONB DEFAULT '{}', -- bonos, equity, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_salaries_position ON public.salaries(position_id);
CREATE INDEX idx_salaries_user ON public.salaries(user_id);

-- RLS for salaries (anonymous viewing, authenticated creating)
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;

-- View aggregated salary data only (not individual reports)
CREATE POLICY "Users can view salary aggregates"
    ON public.salaries FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert salaries"
    ON public.salaries FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COMMENTS (Comentarios sobre puestos - anónimos)
-- ============================================
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL, -- Guardado pero NO mostrado
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    pros TEXT,
    cons TEXT,
    is_current_employee BOOLEAN DEFAULT FALSE,
    employment_status TEXT, -- 'full-time', 'part-time', 'contractor', 'intern'
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_position ON public.comments(position_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);

-- RLS for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by authenticated users"
    ON public.comments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert comments"
    ON public.comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- INTERVIEWS (Info de entrevistas)
-- ============================================
CREATE TABLE public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL, -- Guardado pero NO mostrado
    process_description TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'very_hard')),
    duration_weeks INTEGER,
    interview_rounds INTEGER,
    questions TEXT[],
    got_offer BOOLEAN,
    offer_accepted BOOLEAN,
    tips TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interviews_position ON public.interviews(position_id);

-- RLS for interviews
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interviews are viewable by authenticated users"
    ON public.interviews FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert interviews"
    ON public.interviews FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DOCUMENTS (Recursos/documentos por puesto)
-- ============================================
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    type TEXT, -- 'pdf', 'link', 'video', 'image'
    category TEXT, -- 'interview-prep', 'job-description', 'study-material'
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_position ON public.documents(position_id);

-- RLS for documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Documents are viewable by authenticated users"
    ON public.documents FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert documents"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VIEWS (Vistas útiles)
-- ============================================

-- Vista de salarios agregados por posición
CREATE OR REPLACE VIEW public.position_salary_stats AS
SELECT 
    p.id AS position_id,
    p.title,
    p.company_id,
    c.name AS company_name,
    COUNT(s.id) AS salary_count,
    ROUND(AVG(s.amount), 2) AS salary_avg,
    MIN(s.amount) AS salary_min,
    MAX(s.amount) AS salary_max,
    MODE() WITHIN GROUP (ORDER BY s.currency) AS currency
FROM public.positions p
LEFT JOIN public.salaries s ON s.position_id = p.id
LEFT JOIN public.companies c ON c.id = p.company_id
GROUP BY p.id, p.title, p.company_id, c.name;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Función para obtener estadísticas de una empresa
CREATE OR REPLACE FUNCTION get_company_stats(company_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'positions_count', (SELECT COUNT(*) FROM public.positions WHERE company_id = company_uuid),
        'departments_count', (SELECT COUNT(*) FROM public.departments WHERE company_id = company_uuid),
        'salaries_count', (SELECT COUNT(*) FROM public.salaries s 
                          JOIN public.positions p ON s.position_id = p.id 
                          WHERE p.company_id = company_uuid),
        'comments_count', (SELECT COUNT(*) FROM public.comments c 
                          JOIN public.positions p ON c.position_id = p.id 
                          WHERE p.company_id = company_uuid),
        'avg_salary', (SELECT ROUND(AVG(s.amount), 2) FROM public.salaries s 
                      JOIN public.positions p ON s.position_id = p.id 
                      WHERE p.company_id = company_uuid)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA (Datos de ejemplo)
-- ============================================

-- Insertar empresas de ejemplo
INSERT INTO public.companies (name, slug, description, industry, size, location, website, culture, benefits) VALUES
(
    'Tech Corp',
    'tech-corp',
    'Tech Corp es una empresa líder en desarrollo de software y soluciones tecnológicas. Fundada en 2015, hemos crecido para convertirnos en uno de los principales empleadores del sector tecnológico en Perú.',
    'Tecnología',
    '501-1000',
    'Lima, Perú',
    'https://techcorp.com',
    'Ambiente colaborativo con énfasis en el crecimiento profesional y balance vida-trabajo.',
    ARRAY['Trabajo remoto', 'Seguro de salud', 'Stock options', 'Capacitaciones', 'Gimnasio']
),
(
    'Fintech Solutions',
    'fintech-solutions',
    'Fintech Solutions es una startup de tecnología financiera que está revolucionando la banca digital en Latinoamérica.',
    'Fintech',
    '51-200',
    'Lima, Perú',
    'https://fintechsolutions.pe',
    'Cultura ágil y orientada a resultados. Equipos multidisciplinarios con autonomía.',
    ARRAY['Trabajo remoto 100%', 'Seguro de salud', 'Bonos por desempeño', 'Unlimited PTO']
),
(
    'E-commerce Plus',
    'ecommerce-plus',
    'Plataforma de comercio electrónico líder en el mercado peruano con más de 1 millón de usuarios activos.',
    'E-commerce',
    '201-500',
    'Lima, Perú',
    'https://ecommerceplus.pe',
    'Innovación constante y foco en el cliente. Celebramos los errores como oportunidades de aprendizaje.',
    ARRAY['Descuentos en productos', 'Seguro de salud', 'Horario flexible', 'Home office 3 días']
);

-- Insertar departamentos de ejemplo para Tech Corp
INSERT INTO public.departments (company_id, name, description)
SELECT id, 'Engineering', 'Equipo de desarrollo de software y arquitectura'
FROM public.companies WHERE slug = 'tech-corp';

INSERT INTO public.departments (company_id, name, description)
SELECT id, 'Product', 'Gestión de producto y estrategia'
FROM public.companies WHERE slug = 'tech-corp';

INSERT INTO public.departments (company_id, name, description)
SELECT id, 'Design', 'Diseño de experiencia de usuario e interfaces'
FROM public.companies WHERE slug = 'tech-corp';

-- Insertar posiciones de ejemplo
INSERT INTO public.positions (company_id, department_id, title, description, level, requirements)
SELECT 
    c.id,
    d.id,
    'Senior Software Engineer',
    'Responsable del diseño e implementación de soluciones técnicas escalables.',
    'senior',
    ARRAY['5+ años de experiencia', 'Dominio de React/Node.js', 'Experiencia con cloud (AWS/GCP)', 'Inglés avanzado']
FROM public.companies c
JOIN public.departments d ON d.company_id = c.id AND d.name = 'Engineering'
WHERE c.slug = 'tech-corp';

INSERT INTO public.positions (company_id, department_id, title, description, level, requirements)
SELECT 
    c.id,
    d.id,
    'Product Manager',
    'Lidera la estrategia y roadmap de productos digitales.',
    'mid',
    ARRAY['3+ años en producto', 'Metodologías ágiles', 'Análisis de datos', 'Comunicación efectiva']
FROM public.companies c
JOIN public.departments d ON d.company_id = c.id AND d.name = 'Product'
WHERE c.slug = 'tech-corp';

INSERT INTO public.positions (company_id, department_id, title, description, level, requirements)
SELECT 
    c.id,
    d.id,
    'UX Designer',
    'Diseña experiencias de usuario centradas en las necesidades del cliente.',
    'mid',
    ARRAY['3+ años en UX', 'Figma/Sketch', 'Research de usuarios', 'Portfolio requerido']
FROM public.companies c
JOIN public.departments d ON d.company_id = c.id AND d.name = 'Design'
WHERE c.slug = 'tech-corp';

COMMIT;

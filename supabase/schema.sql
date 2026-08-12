-- ==============================================================================
-- SCHEMA E POLÍTICAS RLS PARA PORTFÓLIO PESSOAL AUTORAL (SUPABASE)
-- ==============================================================================

-- 1. EXTENSÃO PARA UUID (Geralmente ativa por padrão no Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. FUNÇÃO AUXILIAR PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABELA PORTFOLIO_SETTINGS
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    portfolio_name TEXT NOT NULL DEFAULT 'Portfólio Autoral',
    tagline TEXT DEFAULT 'Designer & Desenvolvedor Front-end',
    about_title TEXT DEFAULT 'Sobre Mim',
    about_text TEXT DEFAULT 'Boas-vindas ao meu portfólio autoral. Aqui você encontrará uma seleção de projetos que desenvolvi focando em utilidade, acessibilidade e design autoral.',
    short_bio TEXT DEFAULT 'Explorando as fronteiras entre design de interface, arquitetura de informação e código.',
    profile_image TEXT DEFAULT '',
    whatsapp TEXT DEFAULT '',
    email_public TEXT DEFAULT '',
    location TEXT DEFAULT '',
    social_links JSONB DEFAULT '[]'::jsonb,
    ux_voice TEXT DEFAULT 'direto',
    theme_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at em portfolio_settings
DROP TRIGGER IF EXISTS set_portfolio_settings_updated_at ON public.portfolio_settings;
CREATE TRIGGER set_portfolio_settings_updated_at
    BEFORE UPDATE ON public.portfolio_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. TABELA CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT DEFAULT '',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_categories_owner ON public.categories(owner_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 5. TABELA PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    short_description TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    year INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado')),
    featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para projetos
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- Trigger para updated_at em projects
DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. TABELA PROJECT_BLOCKS
CREATE TABLE IF NOT EXISTS public.project_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('texto', 'imagem', 'video', 'audio')),
    content TEXT DEFAULT '',
    media_url TEXT DEFAULT '',
    alt_text TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    transcript TEXT DEFAULT '',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para ordenação rápida de blocos do projeto
CREATE INDEX IF NOT EXISTS idx_project_blocks_project ON public.project_blocks(project_id, display_order);

-- ==============================================================================
-- SEGURANÇA E ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_blocks ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PORTFOLIO_SETTINGS
-- Leitura pública para todos os visitantes
CREATE POLICY "Permitir leitura publica de portfolio_settings" 
    ON public.portfolio_settings FOR SELECT 
    USING (true);

-- Modificação apenas pelo proprietário autenticado
CREATE POLICY "Permitir modificacao pelo proprietario em portfolio_settings" 
    ON public.portfolio_settings FOR ALL 
    USING (auth.uid() = owner_id) 
    WITH CHECK (auth.uid() = owner_id);

-- POLÍTICAS PARA CATEGORIES
-- Leitura pública para todas as categorias
CREATE POLICY "Permitir leitura publica de categories" 
    ON public.categories FOR SELECT 
    USING (true);

-- Modificação apenas pelo proprietário autenticado
CREATE POLICY "Permitir CRUD pelo proprietario em categories" 
    ON public.categories FOR ALL 
    USING (auth.uid() = owner_id) 
    WITH CHECK (auth.uid() = owner_id);

-- POLÍTICAS PARA PROJECTS
-- Leitura pública apenas de projetos 'publicado', ou todos para o proprietário autenticado
CREATE POLICY "Permitir leitura publica de projetos publicados" 
    ON public.projects FOR SELECT 
    USING (status = 'publicado' OR (auth.uid() IS NOT NULL AND auth.uid() = owner_id));

-- Modificação apenas pelo proprietário autenticado
CREATE POLICY "Permitir CRUD pelo proprietario em projects" 
    ON public.projects FOR ALL 
    USING (auth.uid() = owner_id) 
    WITH CHECK (auth.uid() = owner_id);

-- POLÍTICAS PARA PROJECT_BLOCKS
-- Leitura pública de blocos se o projeto estiver publicado ou se for o proprietário
CREATE POLICY "Permitir leitura publica de blocos de projetos publicados" 
    ON public.project_blocks FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_blocks.project_id 
              AND (p.status = 'publicado' OR (auth.uid() IS NOT NULL AND p.owner_id = auth.uid()))
        )
    );

-- Modificação de blocos pelo proprietário do projeto
CREATE POLICY "Permitir CRUD pelo proprietario em project_blocks" 
    ON public.project_blocks FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_blocks.project_id 
              AND p.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_blocks.project_id 
              AND p.owner_id = auth.uid()
        )
    );

-- ==============================================================================
-- CONFIGURAÇÃO DO SUPABASE STORAGE (BUCKET 'portfolio-media')
-- ==============================================================================
-- Executar no SQL Editor do Supabase se necessário:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

-- Política de leitura pública para o bucket de mídias
CREATE POLICY "Acesso publico de leitura para midias" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'portfolio-media');

-- Política de upload para usuários autenticados
CREATE POLICY "Upload permitido apenas para usuarios autenticados" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated');

-- Política de deleção/atualização para usuários autenticados
CREATE POLICY "Atualizacao e delecao permitidas para usuarios autenticados" 
ON storage.objects FOR ALL 
USING (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated');

-- Fix schema types and relationships
DO $$ 
BEGIN
    -- First, let's check existing tables and their columns
    
    -- 1. User Roles Table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
        CREATE TABLE public.user_roles (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            role text NOT NULL CHECK (role IN ('admin', 'user')),
            created_at timestamptz DEFAULT now(),
            UNIQUE(user_id)
        );
    END IF;

    -- 2. Sources Table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sources') THEN
        CREATE TABLE public.sources (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            name text NOT NULL,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at timestamptz DEFAULT now(),
            UNIQUE(name, user_id)
        );
    END IF;

    -- 3. Categories Table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
        CREATE TABLE public.categories (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            name text NOT NULL,
            source_id uuid REFERENCES public.sources(id) ON DELETE CASCADE,
            created_at timestamptz DEFAULT now(),
            UNIQUE(name, source_id)
        );
    END IF;

    -- 4. Source Permissions Table
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'source_permissions') THEN
        CREATE TABLE public.source_permissions (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            source_id uuid REFERENCES public.sources(id) ON DELETE CASCADE,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            permission text NOT NULL CHECK (permission IN ('read', 'write', 'admin')),
            created_at timestamptz DEFAULT now(),
            UNIQUE(source_id, user_id)
        );
    END IF;

    -- Add RLS Policies
    -- Sources RLS
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sources') THEN
        ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view sources they have access to" ON public.sources;
        CREATE POLICY "Users can view sources they have access to" 
        ON public.sources
        FOR SELECT
        USING (
            auth.uid() = user_id 
            OR 
            EXISTS (
                SELECT 1 FROM public.source_permissions 
                WHERE source_id = sources.id 
                AND user_id = auth.uid()
            )
        );
    END IF;

    -- Categories RLS
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
        ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view categories they have access to" ON public.categories;
        CREATE POLICY "Users can view categories they have access to" 
        ON public.categories
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.sources s
                LEFT JOIN public.source_permissions sp ON s.id = sp.source_id
                WHERE s.id = categories.source_id
                AND (s.user_id = auth.uid() OR sp.user_id = auth.uid())
            )
        );
    END IF;

END $$;

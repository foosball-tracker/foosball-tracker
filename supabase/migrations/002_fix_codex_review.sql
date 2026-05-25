-- Migration: fix Codex review issues
-- 1. Add write access to teams table for authenticated users
-- 2. Align team_members FK column types with referenced bigint IDs

-- =====================================================
-- 1. TEAMS RLS POLICY FIX
-- =====================================================

-- Drop the old SELECT-only policy
DROP POLICY IF EXISTS "Enable read access for all users" ON public.teams;

-- Create full access policy matching players and team_members
CREATE POLICY "Enables full access for authenticated Users" ON public.teams
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 2. TEAM_MEMBERS TYPE ALIGNMENT
-- =====================================================

ALTER TABLE public.team_members
    ALTER COLUMN player_id TYPE bigint;

ALTER TABLE public.team_members
    ALTER COLUMN team_id TYPE bigint;

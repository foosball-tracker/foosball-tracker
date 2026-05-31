-- Allow signed-in app users to start and track matches.
-- Existing admin policies remain in place; these policies add the normal
-- authenticated app workflow for match creation, scoring, realtime hydration,
-- and ending a match.

CREATE POLICY "Authenticated users can track matches"
    ON public.matches
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can track goals"
    ON public.goals
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

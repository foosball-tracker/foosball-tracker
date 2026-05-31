-- Narrow authenticated match/goal access to the active tracking workflow.
-- The current schema cannot express participant-aware access yet; see issue #35.
-- This still improves on the previous FOR ALL policies by preventing
-- authenticated users from mutating completed match history.

DROP POLICY IF EXISTS "Authenticated users can track matches" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can track goals" ON public.goals;

CREATE POLICY "Authenticated users can view matches"
    ON public.matches
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create matches"
    ON public.matches
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can finish active matches"
    ON public.matches
    FOR UPDATE
    TO authenticated
    USING (in_progress = true)
    WITH CHECK (in_progress = false);

CREATE POLICY "Authenticated users can abandon active matches"
    ON public.matches
    FOR DELETE
    TO authenticated
    USING (in_progress = true);

CREATE POLICY "Authenticated users can view goals"
    ON public.goals
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can record goals for active matches"
    ON public.goals
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.matches
            WHERE matches.id = goals.match_id
              AND matches.in_progress = true
        )
    );

CREATE POLICY "Authenticated users can remove goals from active matches"
    ON public.goals
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.matches
            WHERE matches.id = goals.match_id
              AND matches.in_progress = true
        )
    );

-- Migration: link auto-created player teams to their owning player

ALTER TABLE public.teams
    ADD COLUMN player_id bigint;

ALTER TABLE public.teams
    ADD CONSTRAINT teams_player_id_fkey
    FOREIGN KEY (player_id) REFERENCES public.players(id);

WITH ranked_players AS (
    SELECT
        id,
        name,
        row_number() OVER (PARTITION BY name ORDER BY id) AS rn
    FROM public.players
),
ranked_player_teams AS (
    SELECT
        id,
        name,
        row_number() OVER (PARTITION BY name ORDER BY id) AS rn
    FROM public.teams
    WHERE type = 'player'
)
UPDATE public.teams AS teams
SET player_id = ranked_players.id
FROM ranked_player_teams
JOIN ranked_players
    ON ranked_players.name = ranked_player_teams.name
   AND ranked_players.rn = ranked_player_teams.rn
WHERE teams.id = ranked_player_teams.id;

CREATE UNIQUE INDEX teams_player_id_key
    ON public.teams(player_id)
    WHERE player_id IS NOT NULL;

ALTER TABLE public.teams
    ADD CONSTRAINT teams_player_id_type_check
    CHECK (
        (type = 'player' AND player_id IS NOT NULL)
        OR (type = 'team' AND player_id IS NULL)
    );

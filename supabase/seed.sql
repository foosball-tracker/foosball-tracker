-- Seed data for local development
-- Populates the database with sample players, teams, matches, and goals
-- so the main UI and scoring flows can be exercised without manual data entry.

-- Players
INSERT INTO public.players (id, name) VALUES
  (1, 'Alice'),
  (2, 'Bob'),
  (3, 'Charlie'),
  (4, 'Diana');

ALTER SEQUENCE public.players_id_seq RESTART WITH 5;

-- Player-type teams (auto-linked 1:1 with each player)
INSERT INTO public.teams (id, name, type, player_id) VALUES
  (1, 'Alice',   'player'::public.team_type, 1),
  (2, 'Bob',     'player'::public.team_type, 2),
  (3, 'Charlie', 'player'::public.team_type, 3),
  (4, 'Diana',   'player'::public.team_type, 4);

-- Custom multi-player teams
INSERT INTO public.teams (id, name, type) VALUES
  (5, 'Dream Team', 'team'),
  (6, 'Underdogs', 'team');

ALTER SEQUENCE public.teams_id_seq RESTART WITH 7;

-- Team members for custom teams
INSERT INTO public.team_members (player_id, team_id) VALUES
  (1, 5), -- Alice in Dream Team
  (2, 5), -- Bob in Dream Team
  (3, 6), -- Charlie in Underdogs
  (4, 6); -- Diana in Underdogs

-- Matches (some completed, one in progress)
INSERT INTO public.matches (id, created_at, home_team_id, away_team_id, in_progress, goals_to_win) VALUES
  (1, now() - interval '2 hours', 5, 6, false, 10), -- Dream Team vs Underdogs (completed)
  (2, now() - interval '1 hour', 1, 3, false, 10),   -- Alice vs Charlie (completed)
  (3, now(), 2, 4, true, 10);                         -- Bob vs Diana (in progress)

ALTER SEQUENCE public.matches_id_seq RESTART WITH 4;

-- Goals for completed matches
-- Match 1: Dream Team (5) vs Underdogs (6) — Dream Team wins 10-6
INSERT INTO public.goals (id, created_at, goal_time, player_id, team_id, match_id) VALUES
  (1, now() - interval '2 hours', interval '30 seconds', 1, 5, 1),
  (2, now() - interval '1 hour 58 minutes', interval '1 minute', 1, 5, 1),
  (3, now() - interval '1 hour 57 minutes', interval '2 minutes', 3, 6, 1),
  (4, now() - interval '1 hour 55 minutes', interval '3 minutes', 2, 5, 1),
  (5, now() - interval '1 hour 54 minutes', interval '4 minutes', 4, 6, 1),
  (6, now() - interval '1 hour 52 minutes', interval '5 minutes', 1, 5, 1),
  (7, now() - interval '1 hour 51 minutes', interval '6 minutes', 2, 5, 1),
  (8, now() - interval '1 hour 49 minutes', interval '7 minutes', 3, 6, 1),
  (9, now() - interval '1 hour 48 minutes', interval '8 minutes', 4, 6, 1),
  (10, now() - interval '1 hour 46 minutes', interval '9 minutes', 1, 5, 1),
  (11, now() - interval '1 hour 45 minutes', interval '10 minutes', 2, 5, 1),
  (12, now() - interval '1 hour 43 minutes', interval '11 minutes', 3, 6, 1),
  (13, now() - interval '1 hour 42 minutes', interval '12 minutes', 1, 5, 1),
  (14, now() - interval '1 hour 40 minutes', interval '13 minutes', 4, 6, 1),
  (15, now() - interval '1 hour 39 minutes', interval '14 minutes', 2, 5, 1),
  (16, now() - interval '1 hour 37 minutes', interval '15 minutes', 1, 5, 1);

-- Match 2: Alice (1) vs Charlie (3) — Alice wins 10-5
INSERT INTO public.goals (id, created_at, goal_time, player_id, team_id, match_id) VALUES
  (17, now() - interval '1 hour', interval '30 seconds', 1, 1, 2),
  (18, now() - interval '58 minutes', interval '1 minute', 1, 1, 2),
  (19, now() - interval '56 minutes', interval '2 minutes', 3, 3, 2),
  (20, now() - interval '54 minutes', interval '3 minutes', 1, 1, 2),
  (21, now() - interval '52 minutes', interval '4 minutes', 1, 1, 2),
  (22, now() - interval '50 minutes', interval '5 minutes', 3, 3, 2),
  (23, now() - interval '48 minutes', interval '6 minutes', 1, 1, 2),
  (24, now() - interval '46 minutes', interval '7 minutes', 1, 1, 2),
  (25, now() - interval '44 minutes', interval '8 minutes', 3, 3, 2),
  (26, now() - interval '42 minutes', interval '9 minutes', 1, 1, 2),
  (27, now() - interval '40 minutes', interval '10 minutes', 1, 1, 2),
  (28, now() - interval '38 minutes', interval '11 minutes', 3, 3, 2),
  (29, now() - interval '36 minutes', interval '12 minutes', 1, 1, 2),
  (30, now() - interval '34 minutes', interval '13 minutes', 3, 3, 2),
  (31, now() - interval '32 minutes', interval '14 minutes', 1, 1, 2);

ALTER SEQUENCE public.goals_id_seq RESTART WITH 32;

-- =====================================================
-- Match events (event-based scoring model)
-- Mirrors existing goals as goal_detected events, plus
-- examples of sensor sources, deduplication, and corrections.
-- =====================================================

-- Match 1: Dream Team (5) vs Underdogs (6) — Dream Team wins 10-6
INSERT INTO public.match_events (id, created_at, match_id, type, team_id, player_id, source, source_id, dedupe_key, status, goal_time, metadata) VALUES
  (1,  now() - interval '2 hours',          1, 'goal_detected', 5, 1, 'web',    'user-1', NULL, 'valid', interval '30 seconds',  NULL),
  (2,  now() - interval '1 hour 58 minutes', 1, 'goal_detected', 5, 1, 'sensor', 'pico-yellow', 'sensor-1-001', 'valid', interval '1 minute', '{"sensor_side": "yellow"}'),
  (3,  now() - interval '1 hour 57 minutes', 1, 'goal_detected', 6, 3, 'sensor', 'pico-black',  'sensor-1-002', 'valid', interval '2 minutes', '{"sensor_side": "black"}'),
  (4,  now() - interval '1 hour 55 minutes', 1, 'goal_detected', 5, 2, 'web',    'user-1', NULL, 'valid', interval '3 minutes',  NULL),
  (5,  now() - interval '1 hour 54 minutes', 1, 'goal_detected', 6, 4, 'web',    'user-1', NULL, 'valid', interval '4 minutes',  NULL),
  (6,  now() - interval '1 hour 52 minutes', 1, 'goal_detected', 5, 1, 'web',    'user-1', NULL, 'valid', interval '5 minutes',  NULL),
  (7,  now() - interval '1 hour 51 minutes', 1, 'goal_detected', 5, 2, 'web',    'user-1', NULL, 'valid', interval '6 minutes',  NULL),
  (8,  now() - interval '1 hour 49 minutes', 1, 'goal_detected', 6, 3, 'web',    'user-1', NULL, 'valid', interval '7 minutes',  NULL),
  (9,  now() - interval '1 hour 48 minutes', 1, 'goal_detected', 6, 4, 'web',    'user-1', NULL, 'valid', interval '8 minutes',  NULL),
  (10, now() - interval '1 hour 46 minutes', 1, 'goal_detected', 5, 1, 'web',    'user-1', NULL, 'valid', interval '9 minutes',  NULL),
  (11, now() - interval '1 hour 45 minutes', 1, 'goal_detected', 5, 2, 'web',    'user-1', NULL, 'valid', interval '10 minutes', NULL),
  (12, now() - interval '1 hour 43 minutes', 1, 'goal_detected', 6, 3, 'web',    'user-1', NULL, 'valid', interval '11 minutes', NULL),
  (13, now() - interval '1 hour 42 minutes', 1, 'goal_detected', 5, 1, 'web',    'user-1', NULL, 'valid', interval '12 minutes', NULL),
  (14, now() - interval '1 hour 40 minutes', 1, 'goal_detected', 6, 4, 'web',    'user-1', NULL, 'valid', interval '13 minutes', NULL),
  (15, now() - interval '1 hour 39 minutes', 1, 'goal_detected', 5, 2, 'web',    'user-1', NULL, 'valid', interval '14 minutes', NULL),
  (16, now() - interval '1 hour 37 minutes', 1, 'goal_detected', 5, 1, 'web',    'user-1', NULL, 'valid', interval '15 minutes', NULL);

-- Match 2: Alice (1) vs Charlie (3) — Alice wins 10-5
INSERT INTO public.match_events (id, created_at, match_id, type, team_id, player_id, source, source_id, dedupe_key, status, goal_time, metadata) VALUES
  (17, now() - interval '1 hour',  2, 'goal_detected', 1, 1, 'web', 'user-1', NULL, 'valid', interval '30 seconds', NULL),
  (18, now() - interval '58 minutes', 2, 'goal_detected', 1, 1, 'web', 'user-1', NULL, 'valid', interval '1 minute', NULL),
  (19, now() - interval '56 minutes', 2, 'goal_detected', 3, 3, 'web', 'user-1', NULL, 'valid', interval '2 minutes', NULL),
  (20, now() - interval '54 minutes', 2, 'goal_detected', 1, 1, 'web', 'user-1', NULL, 'valid', interval '3 minutes', NULL),
  (21, now() - interval '52 minutes', 2, 'goal_detected', 1, 1, 'web', 'user-1', NULL, 'valid', interval '4 minutes', NULL),
  (22, now() - interval '50 minutes', 2, 'goal_detected', 3, 3, 'web', 'user-1', NULL, 'valid', interval '5 minutes', NULL),
  (23, now() - interval '48 minutes', 2, 'goal_detected', 1, 1, 'web', 'user-1', NULL, 'valid', interval '6 minutes', NULL),
  (24, now() - interval '46 minutes', 2, 'goal_detected', 1, 1, 'web', 'user-1', NULL, 'valid', interval '7 minutes', NULL),
  (25, now() - interval '44 minutes', 2, 'goal_detected', 3, 3, 'web', 'user-1', NULL, 'valid', interval '8 minutes', NULL),
  (26, now() - interval '42 minutes', 2, 'goal_detected', 1, 1, 'web', 'user-1', NULL, 'valid', interval '9 minutes', NULL),
  (27, now() - interval '40 minutes', 2, 'goal_detected', 1, 1, 'web', 'user-1', NULL, 'valid', interval '10 minutes', NULL),
  (28, now() - interval '38 minutes', 2, 'goal_detected', 3, 3, 'web', 'user-1', NULL, 'valid', interval '11 minutes', NULL),
  (29, now() - interval '36 minutes', 2, 'goal_detected', 1, 1, 'web', 'user-1', NULL, 'valid', interval '12 minutes', NULL),
  (30, now() - interval '34 minutes', 2, 'goal_detected', 3, 3, 'web', 'user-1', NULL, 'valid', interval '13 minutes', NULL),
  (31, now() - interval '32 minutes', 2, 'goal_detected', 1, 1, 'web', 'user-1', NULL, 'valid', interval '14 minutes', NULL);

-- Example: a sensor retry that was deduplicated (same dedupe_key rejected by unique index)
-- and a manual correction that invalidated a false sensor goal
INSERT INTO public.match_events (id, created_at, match_id, type, team_id, player_id, source, source_id, dedupe_key, status, goal_time, related_event_id, metadata) VALUES
  (32, now() - interval '1 hour 56 minutes', 1, 'goal_detected',    5, 2, 'sensor', 'pico-yellow', 'sensor-1-003',     'invalid', interval '2 minutes 30 seconds', NULL,  '{"reason": "false trigger, beam bounce"}'),
  (33, now() - interval '1 hour 56 minutes', 1, 'manual_correction', 5, 2, 'web',    'user-1',      NULL,               'valid',   interval '2 minutes 30 seconds', 32,    '{"action": "invalidated false sensor goal"}');

ALTER SEQUENCE public.match_events_id_seq RESTART WITH 34;

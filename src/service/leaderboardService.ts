import {
  clearSupabaseSchemaIssue,
  reportSupabaseSchemaIssue,
  supabase,
} from "~/service/supabaseService";
import type { Tables } from "~/types/database";

type MatchRow = Tables<"matches">;
type MatchEventRow = Tables<"match_events">;
type TeamRow = Tables<"teams">;
type PlayerRow = Tables<"players">;
type TeamMemberRow = Tables<"team_members">;

export interface TeamLeaderboardRow {
  id: number;
  name: string;
  wins: number;
  type: TeamRow["type"];
}

export interface PlayerLeaderboardRow {
  id: number;
  name: string;
  wins: number;
}

export interface LeaderboardSnapshot {
  teams: TeamLeaderboardRow[];
  players: PlayerLeaderboardRow[];
}

export async function getLeaderboardSnapshot(): Promise<LeaderboardSnapshot> {
  if (!supabase) {
    return { teams: [], players: [] };
  }

  const [matchesResult, eventsResult, teamsResult, playersResult, membersResult] =
    await Promise.all([
      supabase.from("matches").select("*").eq("in_progress", false),
      supabase.from("match_events").select("*"),
      supabase.from("teams").select("*"),
      supabase.from("players").select("*"),
      supabase.from("team_members").select("*"),
    ]);

  if (matchesResult.error) {
    reportSupabaseSchemaIssue(matchesResult.error, "loading completed matches");
    console.error("Error fetching completed matches:", matchesResult.error);
    return { teams: [], players: [] };
  }

  if (eventsResult.error || teamsResult.error || playersResult.error || membersResult.error) {
    reportSupabaseSchemaIssue(
      eventsResult.error ?? teamsResult.error ?? playersResult.error ?? membersResult.error,
      "loading leaderboard data"
    );
    console.error(
      "Error fetching leaderboard dependencies:",
      eventsResult.error ?? teamsResult.error ?? playersResult.error ?? membersResult.error
    );
    return { teams: [], players: [] };
  }

  clearSupabaseSchemaIssue();

  return buildLeaderboardSnapshot({
    matches: matchesResult.data ?? [],
    events: eventsResult.data ?? [],
    teams: teamsResult.data ?? [],
    players: playersResult.data ?? [],
    teamMembers: membersResult.data ?? [],
  });
}

function buildLeaderboardSnapshot(input: {
  matches: MatchRow[];
  events: MatchEventRow[];
  players: PlayerRow[];
  teamMembers: TeamMemberRow[];
  teams: TeamRow[];
}): LeaderboardSnapshot {
  const teamById = new Map(input.teams.map((team) => [team.id, team]));
  const eventsByMatch = groupValidGoalEventsByMatch(input.events);
  const teamMembersByTeamId = groupTeamMembersByTeam(input.teamMembers);
  const teamWins = new Map<number, number>();
  const playerWins = new Map<number, number>();

  for (const match of input.matches) {
    const winnerId = getWinnerId(match, eventsByMatch.get(match.id) ?? []);
    if (!winnerId) continue;
    teamWins.set(winnerId, (teamWins.get(winnerId) ?? 0) + 1);
    addPlayerWinsForTeam(winnerId, teamById, teamMembersByTeamId, playerWins);
  }

  const teams = input.teams
    .filter((team) => team.type === "team")
    .map((team) => ({
      id: team.id,
      name: team.name,
      wins: teamWins.get(team.id) ?? 0,
      type: team.type,
    }))
    .sort((left, right) => right.wins - left.wins || left.name.localeCompare(right.name));

  const players = input.players
    .map((player) => ({
      id: player.id,
      name: player.name,
      wins: playerWins.get(player.id) ?? 0,
    }))
    .sort((left, right) => right.wins - left.wins || left.name.localeCompare(right.name));

  return { teams, players };
}

function groupValidGoalEventsByMatch(events: MatchEventRow[]) {
  const eventsByMatch = new Map<number, MatchEventRow[]>();

  for (const event of events) {
    if (event.type !== "goal_detected" || event.status !== "valid") continue;
    const existing = eventsByMatch.get(event.match_id) ?? [];
    existing.push(event);
    eventsByMatch.set(event.match_id, existing);
  }

  return eventsByMatch;
}

function groupTeamMembersByTeam(teamMembers: TeamMemberRow[]) {
  const teamMembersByTeamId = new Map<number, number[]>();

  for (const member of teamMembers) {
    const existing = teamMembersByTeamId.get(member.team_id) ?? [];
    existing.push(member.player_id);
    teamMembersByTeamId.set(member.team_id, existing);
  }

  return teamMembersByTeamId;
}

function getWinnerId(match: MatchRow, matchEvents: MatchEventRow[]) {
  const scoreByTeam = new Map<number, number>();

  for (const event of matchEvents) {
    scoreByTeam.set(event.team_id, (scoreByTeam.get(event.team_id) ?? 0) + 1);
  }

  const homeScore = scoreByTeam.get(match.home_team_id) ?? 0;
  const awayScore = scoreByTeam.get(match.away_team_id) ?? 0;
  const winningScore = Math.max(homeScore, awayScore);

  if (homeScore === awayScore || winningScore < match.goals_to_win) return null;
  return homeScore > awayScore ? match.home_team_id : match.away_team_id;
}

function addPlayerWinsForTeam(
  teamId: number,
  teamById: Map<number, TeamRow>,
  teamMembersByTeamId: Map<number, number[]>,
  playerWins: Map<number, number>
) {
  const winnerTeam = teamById.get(teamId);
  if (!winnerTeam) return;

  if (winnerTeam.type === "player" && winnerTeam.player_id) {
    playerWins.set(winnerTeam.player_id, (playerWins.get(winnerTeam.player_id) ?? 0) + 1);
    return;
  }

  for (const playerId of teamMembersByTeamId.get(teamId) ?? []) {
    playerWins.set(playerId, (playerWins.get(playerId) ?? 0) + 1);
  }
}

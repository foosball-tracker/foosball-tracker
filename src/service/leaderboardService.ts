import { supabase } from "~/service/supabaseService";
import type { Tables } from "~/types/database";

type MatchRow = Tables<"matches">;
type GoalRow = Tables<"goals">;
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

  const [matchesResult, goalsResult, teamsResult, playersResult, membersResult] = await Promise.all(
    [
      supabase.from("matches").select("*").eq("in_progress", false),
      supabase.from("goals").select("*"),
      supabase.from("teams").select("*"),
      supabase.from("players").select("*"),
      supabase.from("team_members").select("*"),
    ]
  );

  if (matchesResult.error) {
    console.error("Error fetching completed matches:", matchesResult.error);
    return { teams: [], players: [] };
  }

  if (goalsResult.error || teamsResult.error || playersResult.error || membersResult.error) {
    console.error(
      "Error fetching leaderboard dependencies:",
      goalsResult.error ?? teamsResult.error ?? playersResult.error ?? membersResult.error
    );
    return { teams: [], players: [] };
  }

  return buildLeaderboardSnapshot({
    matches: matchesResult.data ?? [],
    goals: goalsResult.data ?? [],
    teams: teamsResult.data ?? [],
    players: playersResult.data ?? [],
    teamMembers: membersResult.data ?? [],
  });
}

function buildLeaderboardSnapshot(input: {
  matches: MatchRow[];
  goals: GoalRow[];
  players: PlayerRow[];
  teamMembers: TeamMemberRow[];
  teams: TeamRow[];
}): LeaderboardSnapshot {
  const teamById = new Map(input.teams.map((team) => [team.id, team]));
  const goalsByMatch = groupGoalsByMatch(input.goals);
  const teamMembersByTeamId = groupTeamMembersByTeam(input.teamMembers);
  const teamWins = new Map<number, number>();
  const playerWins = new Map<number, number>();

  for (const match of input.matches) {
    const winnerId = getWinnerId(match, goalsByMatch.get(match.id) ?? []);
    if (!winnerId) continue;
    teamWins.set(winnerId, (teamWins.get(winnerId) ?? 0) + 1);
    addPlayerWinsForTeam(winnerId, teamById, teamMembersByTeamId, playerWins);
  }

  const teams = input.teams
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

function groupGoalsByMatch(goals: GoalRow[]) {
  const goalsByMatch = new Map<number, GoalRow[]>();

  for (const goal of goals) {
    const existing = goalsByMatch.get(goal.match_id) ?? [];
    existing.push(goal);
    goalsByMatch.set(goal.match_id, existing);
  }

  return goalsByMatch;
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

function getWinnerId(match: MatchRow, matchGoals: GoalRow[]) {
  const scoreByTeam = new Map<number, number>();

  for (const goal of matchGoals) {
    scoreByTeam.set(goal.team_id, (scoreByTeam.get(goal.team_id) ?? 0) + 1);
  }

  const homeScore = scoreByTeam.get(match.home_team_id) ?? 0;
  const awayScore = scoreByTeam.get(match.away_team_id) ?? 0;

  if (homeScore === awayScore) return null;
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

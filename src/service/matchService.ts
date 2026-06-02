import {
  clearSupabaseSchemaIssue,
  reportSupabaseSchemaIssue,
  requireSupabase,
  supabase,
} from "~/service/supabaseService";
import type { Tables } from "~/types/database";

type GoalsRow = Tables<"goals">;
type MatchesRow = Tables<"matches">;
type MatchEventRow = Tables<"match_events">;

export function formatGoalTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `00:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export async function createMatch(
  homeTeamId: number,
  awayTeamId: number,
  goalsToWin: number
): Promise<MatchesRow | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("matches")
    .insert([{ home_team_id: homeTeamId, away_team_id: awayTeamId, goals_to_win: goalsToWin }])
    .select()
    .single();
  if (error) {
    console.error("Error creating match:", error);
    return null;
  }
  return data;
}

export async function recordGoalEvent(
  matchId: number,
  teamId: number,
  timer: number,
  formatTime: (seconds: number) => string
): Promise<number | null> {
  const client = requireSupabase();
  const goalTime = formatTime(timer);
  const { data, error } = await client.rpc("record_goal_event", {
    p_match_id: matchId,
    p_team_id: teamId,
    p_source: "web",
    p_source_id: undefined,
    p_goal_time: goalTime,
  });
  if (error) {
    reportSupabaseSchemaIssue(error, "recording a goal");
    console.error("Error recording goal event:", error);
    return null;
  }
  clearSupabaseSchemaIssue();
  return data;
}

export async function invalidateGoalEvent(
  eventId: number,
  reason?: string
): Promise<number | null> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("invalidate_goal_event", {
    p_event_id: eventId,
    p_reason: reason ?? undefined,
  });
  if (error) {
    reportSupabaseSchemaIssue(error, "invalidating a goal");
    console.error("Error invalidating goal event:", error);
    return null;
  }
  clearSupabaseSchemaIssue();
  return data;
}

export async function invalidateLastGoalForTeam(
  matchId: number,
  teamId: number,
  reason?: string
): Promise<number | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("match_events")
    .select("id")
    .eq("match_id", matchId)
    .eq("team_id", teamId)
    .eq("type", "goal_detected")
    .eq("status", "valid")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    reportSupabaseSchemaIssue(error, "loading goal history");
    console.error("Error fetching latest goal event:", error);
    return null;
  }

  if (!data?.length) {
    console.warn("No valid goal to invalidate for team", teamId);
    return null;
  }

  return invalidateGoalEvent(data[0].id, reason);
}

export async function resetMatchScore(matchId: number, reason?: string): Promise<number | null> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("reset_match_score", {
    p_match_id: matchId,
    p_reason: reason ?? undefined,
  });
  if (error) {
    reportSupabaseSchemaIssue(error, "resetting the match score");
    console.error("Error resetting match score:", error);
    return null;
  }
  clearSupabaseSchemaIssue();
  return data;
}

export async function fetchMatchEvents(matchId: number): Promise<MatchEventRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("match_events")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at");
  if (error) {
    reportSupabaseSchemaIssue(error, "loading match events");
    console.error("Error fetching match events:", error);
    return [];
  }
  clearSupabaseSchemaIssue();
  return data;
}

export async function fetchGoalsForMatch(matchId: number): Promise<GoalsRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at");
  if (error) {
    console.error("Error fetching goals:", error);
    return [];
  }
  return data;
}

export async function getLatestMatch() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("in_progress", true)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) {
    console.error("Error fetching current match:", error);
    return null;
  }
  return data?.length ? data[0] : null;
}

export async function endGame(matchId: number) {
  const client = requireSupabase();
  const { error } = await client.from("matches").update({ in_progress: false }).eq("id", matchId);
  if (error) {
    console.error("Error updating match status:", error);
    return false;
  }
  return true;
}

export async function abandonMatch(matchId: number) {
  const client = requireSupabase();

  const { error: eventsError } = await client.from("match_events").delete().eq("match_id", matchId);
  if (eventsError) {
    console.error("Error deleting abandoned match events:", eventsError);
    return false;
  }

  const { error: goalsError } = await client.from("goals").delete().eq("match_id", matchId);
  if (goalsError) {
    console.error("Error deleting abandoned match goals:", goalsError);
    return false;
  }

  const { error: matchError } = await client.from("matches").delete().eq("id", matchId);
  if (matchError) {
    console.error("Error deleting abandoned match:", matchError);
    return false;
  }

  return true;
}

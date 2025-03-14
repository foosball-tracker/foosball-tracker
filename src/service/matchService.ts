// src/services/matchService.ts
import { supabase } from "~/service/supabaseService";
import type { Tables } from "~/types/database";

type GoalsRow = Tables<"goals">;
type MatchesRow = Tables<"matches">;

export async function createMatch(
  homeTeamId: number,
  awayTeamId: number,
  goalsToWin: number
): Promise<MatchesRow | null> {
  const { data, error } = await supabase
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

export async function recordGoal(
  matchId: number,
  teamId: number,
  timer: number,
  formatTime: (sec: number) => string
) {
  const goalTime = `00:${formatTime(timer)}`;
  const { error } = await supabase.from("goals").insert({
    match_id: matchId,
    team_id: teamId,
    goal_time: goalTime,
  });
  if (error) console.error("Error recording goal:", error);
}

export async function removeLastGoal(matchId: number, teamId: number) {
  const { data: foundGoals, error: fetchErr } = await supabase
    .from("goals")
    .select("*")
    .eq("match_id", matchId)
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (fetchErr || !foundGoals?.length) {
    console.error("Error fetching last goal:", fetchErr);
    return;
  }
  const { error: deleteErr } = await supabase.from("goals").delete().eq("id", foundGoals[0].id);
  if (deleteErr) console.error("Error deleting goal:", deleteErr);
}

export async function fetchGoalsForMatch(matchId: number): Promise<GoalsRow[]> {
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
  const { error } = await supabase.from("matches").update({ in_progress: false }).eq("id", matchId);
  if (error) {
    console.error("Error updating match status:", error);
    return false;
  }
  return true;
}

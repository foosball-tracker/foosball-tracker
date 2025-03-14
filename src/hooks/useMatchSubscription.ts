// src/hooks/useMatchSubscription.ts
import { onCleanup } from "solid-js";
import { supabase } from "~/service/supabaseService";
import type { Tables } from "~/types/database";

type GoalsRow = Tables<"goals">;

export function useMatchSubscription(
  matchId: number,
  onGoalInsert: (goal: GoalsRow) => void,
  onGoalDelete: (goalId: number) => void
) {
  const channel = supabase
    .channel(`match_goals_${matchId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "goals" }, (payload) => {
      const newGoal = payload.new as GoalsRow;
      if (newGoal.match_id === matchId) onGoalInsert(newGoal);
    })
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "goals" }, (payload) => {
      const oldGoalId = payload.old.id;
      if (oldGoalId) onGoalDelete(oldGoalId);
    })
    .subscribe();

  onCleanup(() => {
    channel.unsubscribe().then(() => console.info("Unsubscribed from match goals"));
  });
}

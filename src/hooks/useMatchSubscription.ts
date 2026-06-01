import { onCleanup } from "solid-js";
import { supabase } from "~/service/supabaseService";
import type { Tables } from "~/types/database";

type MatchEventRow = Tables<"match_events">;

export function useMatchSubscription(
  matchId: number,
  onEventInsert: (event: MatchEventRow) => void,
  onEventUpdate: (event: MatchEventRow) => void
) {
  if (!supabase) return;
  const channel = supabase
    .channel(`match_events_${matchId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "match_events" },
      (payload) => {
        const newEvent = payload.new as MatchEventRow;
        if (newEvent.match_id === matchId) onEventInsert(newEvent);
      }
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "match_events" },
      (payload) => {
        const updatedEvent = payload.new as MatchEventRow;
        if (updatedEvent.match_id === matchId) onEventUpdate(updatedEvent);
      }
    )
    .subscribe();

  onCleanup(() => {
    channel.unsubscribe().then(() => console.info("Unsubscribed from match events"));
  });
}

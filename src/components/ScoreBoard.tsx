import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { supabase } from "~/service/supabaseService";
import { Tables } from "~/types/database";
import { TeamScore } from "~/components/TeamScore";
import { playSound } from "../service/soundService";
import { gameState, setGameState } from "../store/gameStore";
import type { ISettings } from "../types/Settings";

type GoalsRow = Tables<"goals">;
type MatchesRow = Tables<"matches">;

interface ScoreBoardProps {
  settings: ISettings;
}

export function ScoreBoard(props: ScoreBoardProps) {
  // Track current match
  const [currentMatch, setCurrentMatch] = createSignal<MatchesRow | null>(null);
  // Supabase goals for this match
  const [goals, setGoals] = createSignal<GoalsRow[]>([]);

  // Derived scores
  const yellowScore = createMemo(
    () => goals().filter((g) => g.team_id === props.settings.yellowTeam.id).length
  );
  const blackScore = createMemo(
    () => goals().filter((g) => g.team_id === props.settings.blackTeam.id).length
  );

  // Format seconds as mm:ss for display
  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const endGame = async () => {
    const match = currentMatch();
    if (!match) return;

    // Update the match's in_progress field
    const { error } = await supabase
      .from("matches")
      .update({ in_progress: false })
      .eq("id", match.id);

    if (error) {
      console.error("Error updating match status:", error);
      return;
    }

    playSound("win");
    setGameState("gameRunning", false);
  };

  /**
   * Central handler for a newly inserted goal row in Supabase
   */
  const handleGoalInsert = (newGoal: GoalsRow) => {
    // Avoid duplicates (if we inserted it locally, we might already have it)
    // If the array doesn't contain that id, add it + do side effects
    setGoals((prev) => {
      if (prev.find((g) => g.id === newGoal.id)) {
        return prev; // we already have it
      }
      return [...prev, newGoal];
    });

    // Play sound
    playSound("goal");
  };

  /**
   * Central handler for a deleted goal row
   */
  const handleGoalDelete = (oldGoalId: number) => {
    setGoals((prev) => prev.filter((g) => g.id !== oldGoalId));
    // For a deletion, let's do "no-goal" sound
    playSound("no-goal");
  };

  // Insert a new goal into Supabase (no immediate local changes).
  // We'll rely on the subscription callback to update local state and play sound
  const recordGoal = async (teamId: number) => {
    const match = currentMatch();
    if (!match) return;

    const goalTime = `00:${formatTime(gameState.timer)}`;
    const { error } = await supabase.from("goals").insert({
      match_id: match.id,
      team_id: teamId,
      goal_time: goalTime,
    });
    if (error) console.error("Error recording goal:", error);
  };

  // Delete the last goal for a team
  const removeLastGoal = async (teamId: number) => {
    const match = currentMatch();
    if (!match) return;

    const { data: foundGoals, error: fetchErr } = await supabase
      .from("goals")
      .select("*")
      .eq("match_id", match.id)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchErr || !foundGoals?.length) {
      console.error("Error fetching last goal:", fetchErr);
      return;
    }

    const { error: deleteErr } = await supabase.from("goals").delete().eq("id", foundGoals[0].id);

    if (deleteErr) console.error("Error deleting goal:", deleteErr);
  };

  /**
   * This is what you call from UI buttons to increase or decrease a team's score.
   * We do NOT do local immediate changes or sounds here to avoid double updates.
   * Instead, we rely on realtime subscription => handleGoalInsert or handleGoalDelete.
   */
  const adjustGoal = async (teamId: number, inc: number) => {
    if (!gameState.gameRunning || !currentMatch()) return;
    if (inc > 0) {
      await recordGoal(teamId);
    } else {
      await removeLastGoal(teamId);
    }
  };

  // Start a new match in the DB
  const createMatch = async (homeTeamId: number, awayTeamId: number) => {
    const { data, error } = await supabase
      .from("matches")
      .insert([
        {
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          goals_to_win: props.settings.goalsToWin,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating match:", error);
      return null;
    }
    return data;
  };

  const startGame = async () => {
    const { blackTeam, yellowTeam } = props.settings;
    if (!blackTeam.id || !yellowTeam.id) {
      alert("Please select both teams before starting the game.");
      return;
    }
    // Yellow team is home, black team is away
    const match = await createMatch(yellowTeam.id, blackTeam.id);
    if (!match) return;

    setCurrentMatch(match);
    setGoals([]);
    setGameState({
      timer: 0,
      gameRunning: true,
      goalHistory: [],
    });
  };

  const resetScores = () => {
    setCurrentMatch(null);
    setGoals([]);
    setGameState({
      timer: 0,
      gameRunning: false,
      goalHistory: [],
    });
  };

  // Fetch goals from DB
  const fetchGoalsForMatch = async (matchId: number) => {
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
  };

  // Realtime subscription
  let subscriptionChannel: ReturnType<typeof supabase.channel> | null = null;

  const subscribeToGoals = (matchId: number) => {
    // Clean up old subscription if any
    subscriptionChannel?.unsubscribe();

    // New channel for goals
    subscriptionChannel = supabase
      .channel("match_goals")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "goals" }, (payload) => {
        const newGoal = payload.new as GoalsRow;
        if (newGoal.match_id === matchId) {
          handleGoalInsert(newGoal);
        }
      })
      .on<Tables<"goals">>(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "goals" },
        (payload) => {
          console.log("deleted goal", payload);
          const oldGoalId = payload.old.id;
          if (oldGoalId) {
            handleGoalDelete(oldGoalId);
          }
        }
      )
      .subscribe();
  };

  const getLatestMatch = async () => {
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
  };

  onMount(async () => {
    // Possibly load a "current" match if it exists
    const match = await getLatestMatch();
    if (match) {
      setCurrentMatch(match);
      setGameState("gameRunning", true); // optional
      const existingGoals = await fetchGoalsForMatch(match.id);
      setGoals(existingGoals);
    }

    // Start timer
    const timerInterval = setInterval(() => {
      if (gameState.gameRunning) {
        setGameState("timer", (t) => t + 1);
      }
    }, 1000);

    onCleanup(() => clearInterval(timerInterval));
  });

  // Whenever we have a new currentMatch, subscribe to it
  createEffect(() => {
    const match = currentMatch();
    if (match) {
      subscribeToGoals(match.id);
    }
  });

  // Watch for the score crossing the threshold
  createEffect(() => {
    if (!gameState.gameRunning) return;
    const goalsToWin = props.settings.goalsToWin;
    if (blackScore() >= goalsToWin || yellowScore() >= goalsToWin) {
      endGame().then(() => console.log("Game ended"));
    }
  });

  return (
    <div class="card card-border bg-base-300 max-w-3xl">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <h2 class="card-title text-2xl">Score</h2>
          <div class="flex gap-2">
            {!gameState.gameRunning && (
              <button class="btn btn-sm btn-primary" onClick={startGame}>
                Start Game
              </button>
            )}
            <button class="btn btn-sm btn-error" onClick={resetScores}>
              Reset Game
            </button>
          </div>
        </div>

        <div class="flex-col">
          <div class="flex justify-center">
            <span class="text-center text-xl">Time: {formatTime(gameState.timer)}</span>
          </div>

          {/* Teams side by side */}
          <div class="mt-4 flex w-full items-center justify-center gap-4">
            {/* Yellow side */}
            <div class="flex flex-1 justify-end">
              <TeamScore
                team="yellow"
                teamName={props.settings.yellowTeam.name ?? "Yellow Team"}
                score={yellowScore()}
                updateScore={(inc) => adjustGoal(props.settings.yellowTeam.id!, inc)}
              />
            </div>

            <div class="text-3xl font-bold">:</div>

            {/* Black side */}
            <div class="flex flex-1 justify-start">
              <TeamScore
                team="black"
                teamName={props.settings.blackTeam.name ?? "Black Team"}
                score={blackScore()}
                updateScore={(inc) => adjustGoal(props.settings.blackTeam.id!, inc)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/ScoreBoard.tsx
import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { TeamScore } from "~/components/TeamScore";
import { playSound } from "../service/soundService";
import { gameState, setGameState } from "../store/gameStore";
import { useMatchSubscription } from "../hooks/useMatchSubscription";
import type { ISettings } from "../types/Settings";
import type { Tables } from "~/types/database";
import { useGameTimer } from "~/hooks/useGamerTimer";
import { formatTime } from "~/lib/utils.ts";
import * as matchService from "../service/matchService";

type GoalsRow = Tables<"goals">;
type MatchesRow = Tables<"matches">;

interface ScoreBoardProps {
  settings: Readonly<ISettings>;
}

export function ScoreBoard(props: Readonly<ScoreBoardProps>) {
  // Track current match
  const [currentMatch, setCurrentMatch] = createSignal<MatchesRow | null>(null);
  // Supabase goals for this match
  const [goals, setGoals] = createSignal<GoalsRow[]>([]);

  // Timer hook
  const { elapsedTime, start, stop, reset } = useGameTimer();

  // Derived scores
  const yellowScore = createMemo(
    () => goals().filter((g) => g.team_id === props.settings.yellowTeam.id).length
  );
  const blackScore = createMemo(
    () => goals().filter((g) => g.team_id === props.settings.blackTeam.id).length
  );

  const handleGoalInsert = (newGoal: GoalsRow) => {
    setGoals((prev) => (prev.find((g) => g.id === newGoal.id) ? prev : [...prev, newGoal]));
    playSound("goal");
  };

  const handleGoalDelete = (oldGoalId: number) => {
    setGoals((prev) => prev.filter((g) => g.id !== oldGoalId));
    playSound("no-goal");
  };

  const adjustGoal = async (teamId: number, inc: number) => {
    if (!gameState.gameRunning || !currentMatch()) return;
    if (inc > 0) {
      await matchService.recordGoal(currentMatch()!.id, teamId, gameState.timer, formatTime);
    } else {
      await matchService.removeLastGoal(currentMatch()!.id, teamId);
    }
  };

  const startGame = async () => {
    const { blackTeam, yellowTeam } = props.settings;
    if (!blackTeam.id || !yellowTeam.id) {
      alert("Please select both teams before starting the game.");
      return;
    }
    const match = await matchService.createMatch(
      yellowTeam.id,
      blackTeam.id,
      props.settings.goalsToWin
    );
    if (!match) return;

    setCurrentMatch(match);
    setGoals([]);
    setGameState({ timer: 0, gameRunning: true, goalHistory: [] });
    start();
  };

  const resetScores = () => {
    setCurrentMatch(null);
    setGoals([]);
    setGameState({ timer: 0, gameRunning: false, goalHistory: [] });
    reset();
  };

  const endCurrentGame = async () => {
    const match = currentMatch();
    if (!match) return;
    if (await matchService.endGame(match.id)) {
      playSound("win");
      setGameState("gameRunning", false);
      stop();
    }
  };

  onMount(async () => {
    const match = await matchService.getLatestMatch();
    if (match) {
      setCurrentMatch(match);
      setGameState("gameRunning", true);
      const existingGoals = await matchService.fetchGoalsForMatch(match.id);
      setGoals(existingGoals);
      start();
    }
    // Ensure timer stops on unmount
    onCleanup(() => stop());
  });

  // Subscribe to real-time updates if a match is active
  createEffect(() => {
    const match = currentMatch();
    if (match) {
      useMatchSubscription(match.id, handleGoalInsert, handleGoalDelete);
    }
  });

  // Check for game end condition
  createEffect(() => {
    if (!gameState.gameRunning) return;
    if (blackScore() >= props.settings.goalsToWin || yellowScore() >= props.settings.goalsToWin) {
      endCurrentGame().then(() => console.log("Game ended"));
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
            <span class="text-center text-xl">Time: {formatTime(elapsedTime())}</span>
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

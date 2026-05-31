import { createEffect, createResource, createSignal, onCleanup, onMount } from "solid-js";
import { createLocalStorageStore } from "../hooks/createLocalStorageStore.tsx";
import { useAuthSession } from "~/hooks/useAuthSession.ts";
import { useGameTimer } from "~/hooks/useGamerTimer.ts";
import { useMatchSubscription } from "~/hooks/useMatchSubscription.ts";
import { MatchDashboard } from "~/components/home/MatchDashboard.tsx";
import { HomeShell } from "~/components/home/HomeShell.tsx";
import { MatchSetupPanel } from "~/components/home/MatchSetupPanel.tsx";
import type { ISettings } from "../types/Settings.ts";
import * as matchService from "../service/matchService";
import { playSound } from "~/service/soundService.ts";
import { getAllTeams, getTeamsByIds } from "~/service/teamService.ts";
import type { Tables } from "~/types/database.ts";
import "../App.css";

type MatchRow = Tables<"matches">;
type GoalRow = Tables<"goals">;

export default function ProtectedApp() {
  useAuthSession();
  const [settings, setSettings] = createLocalStorageStore<ISettings>("settings", {
    yellowTeam: { id: undefined, name: "Yellow Team" },
    blackTeam: { id: undefined, name: "Black Team" },
    goalsToWin: 6,
  });
  const [availableTeams] = createResource(getAllTeams);
  const [currentMatch, setCurrentMatch] = createSignal<MatchRow | null>(null);
  const [goals, setGoals] = createSignal<GoalRow[]>([]);
  const [isPaused, setIsPaused] = createSignal(false);
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = createSignal(0);
  const { elapsedTime, reset, running, start, stop } = useGameTimer();

  const syncSettingsWithMatch = async (match: MatchRow) => {
    const teams = await getTeamsByIds([match.home_team_id, match.away_team_id]);
    const teamById = new Map(teams.map((team) => [team.id, team]));
    const yellowTeam = teamById.get(match.home_team_id);
    const blackTeam = teamById.get(match.away_team_id);

    if (yellowTeam) {
      setSettings("yellowTeam", { id: yellowTeam.id, name: yellowTeam.name });
    }

    if (blackTeam) {
      setSettings("blackTeam", { id: blackTeam.id, name: blackTeam.name });
    }

    setSettings("goalsToWin", match.goals_to_win);
  };

  const hydrateActiveMatch = async () => {
    const match = await matchService.getLatestMatch();
    if (!match) return;

    setCurrentMatch(match);
    setGoals(await matchService.fetchGoalsForMatch(match.id));
    await syncSettingsWithMatch(match);
    setIsPaused(false);
    start();
  };

  const handleGoalInsert = (newGoal: GoalRow) => {
    setGoals((prev) => (prev.find((goal) => goal.id === newGoal.id) ? prev : [...prev, newGoal]));
    playSound("goal");
  };

  const handleGoalDelete = (goalId: number) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    playSound("no-goal");
  };

  const startGame = async () => {
    const { blackTeam, yellowTeam } = settings;
    if (!blackTeam.id || !yellowTeam.id) {
      alert("Please select both teams before starting the game.");
      return;
    }

    const match = await matchService.createMatch(yellowTeam.id, blackTeam.id, settings.goalsToWin);
    if (!match) return;

    reset();
    setCurrentMatch(match);
    setGoals([]);
    setIsPaused(false);
    start();
  };

  const adjustGoal = async (teamId: number, increment: number) => {
    const match = currentMatch();
    if (!match || !running() || isPaused()) return;

    if (increment > 0) {
      await matchService.recordGoal(match.id, teamId, elapsedTime(), matchService.formatGoalTime);
      return;
    }

    await matchService.removeLastGoal(match.id, teamId);
  };

  const finalizeCurrentMatch = async (matchId: number) => {
    const didEnd = await matchService.endGame(matchId);
    if (!didEnd) return false;

    stop();
    setIsPaused(false);
    setCurrentMatch((match) => (match ? { ...match, in_progress: false } : match));
    setLeaderboardRefreshKey((value) => value + 1);
    return true;
  };

  const resetGame = async () => {
    const match = currentMatch();
    if (match?.in_progress) {
      await finalizeCurrentMatch(match.id);
    }

    reset();
    setGoals([]);
    setCurrentMatch(null);
  };

  const togglePause = () => {
    if (isPaused()) {
      start();
      setIsPaused(false);
      return;
    }

    stop();
    setIsPaused(true);
  };

  onMount(() => {
    void hydrateActiveMatch();
    onCleanup(() => stop());
  });

  createEffect(() => {
    const match = currentMatch();
    if (match?.in_progress) {
      useMatchSubscription(match.id, handleGoalInsert, handleGoalDelete);
    }
  });

  createEffect(() => {
    const match = currentMatch();
    if (!match?.in_progress || isPaused()) return;

    const yellowScore = goals().filter((goal) => goal.team_id === settings.yellowTeam.id).length;
    const blackScore = goals().filter((goal) => goal.team_id === settings.blackTeam.id).length;

    if (yellowScore < settings.goalsToWin && blackScore < settings.goalsToWin) return;

    void finalizeCurrentMatch(match.id).then((didEnd) => {
      if (didEnd) {
        playSound("win");
      }
    });
  });

  return (
    <HomeShell>
      {currentMatch()?.in_progress ? (
        <MatchDashboard
          currentMatch={currentMatch()!}
          elapsedTime={elapsedTime()}
          goals={goals()}
          isPaused={isPaused()}
          leaderboardRefreshKey={leaderboardRefreshKey()}
          onAdjustGoal={adjustGoal}
          onResetGame={resetGame}
          onTogglePause={togglePause}
          settings={settings}
        />
      ) : (
        <MatchSetupPanel
          onStartGame={startGame}
          settings={settings}
          setSettings={setSettings}
          teamOptions={availableTeams() ?? []}
        />
      )}
    </HomeShell>
  );
}

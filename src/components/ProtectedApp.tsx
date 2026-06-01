import { createEffect, createResource, createSignal, onCleanup, onMount, Show } from "solid-js";
import { createLocalStorageStore } from "../hooks/createLocalStorageStore.tsx";
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
type MatchEventRow = Tables<"match_events">;

export default function ProtectedApp() {
  const [settings, setSettings] = createLocalStorageStore<ISettings>("settings", {
    yellowTeam: { id: undefined, name: "Yellow Team" },
    blackTeam: { id: undefined, name: "Black Team" },
    goalsToWin: 6,
  });
  const [availableTeams] = createResource(getAllTeams);
  const [currentMatch, setCurrentMatch] = createSignal<MatchRow | null>(null);
  const [matchEvents, setMatchEvents] = createSignal<MatchEventRow[]>([]);
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
    setMatchEvents(await matchService.fetchMatchEvents(match.id));
    await syncSettingsWithMatch(match);
    setIsPaused(false);
    start();
  };

  const handleEventInsert = (event: MatchEventRow) => {
    setMatchEvents((prev) => (prev.some((e) => e.id === event.id) ? prev : [...prev, event]));
    if (event.type === "goal_detected" && event.status === "valid") {
      playSound("goal");
    }
  };

  const handleEventUpdate = (updatedEvent: MatchEventRow) => {
    setMatchEvents((prev) => {
      const oldEvent = prev.find((e) => e.id === updatedEvent.id);
      const wasValidGoal = oldEvent?.type === "goal_detected" && oldEvent?.status === "valid";
      const isNoLongerValid =
        updatedEvent.type === "goal_detected" && updatedEvent.status !== "valid";

      if (wasValidGoal && isNoLongerValid) {
        playSound("no-goal");
      }

      return prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e));
    });
  };

  const startGame = async () => {
    const { blackTeam, yellowTeam } = settings;
    if (!blackTeam.id || !yellowTeam.id) {
      alert("Please select both teams before starting the game.");
      return;
    }

    const match = await matchService.createMatch(yellowTeam.id, blackTeam.id, settings.goalsToWin);
    if (!match) {
      alert("Could not start the match. Please try again.");
      return;
    }

    reset();
    setCurrentMatch(match);
    setMatchEvents([]);
    setIsPaused(false);
    start();
  };

  const adjustGoal = async (teamId: number, increment: number) => {
    const match = currentMatch();
    if (!match || !running() || isPaused()) return;

    if (increment > 0) {
      await matchService.recordGoalEvent(
        match.id,
        teamId,
        elapsedTime(),
        matchService.formatGoalTime
      );
      return;
    }

    await matchService.invalidateLastGoalForTeam(match.id, teamId, "manual correction");
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
      const didAbandon = await matchService.abandonMatch(match.id);
      if (!didAbandon) return;
    }

    stop();
    setIsPaused(false);
    reset();
    setMatchEvents([]);
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

  const countValidGoals = (teamId: number | undefined) => {
    if (!teamId) return 0;
    return matchEvents().filter(
      (e) => e.type === "goal_detected" && e.status === "valid" && e.team_id === teamId
    ).length;
  };

  onMount(() => {
    void hydrateActiveMatch();
    onCleanup(() => stop());
  });

  createEffect(() => {
    const match = currentMatch();
    if (match?.in_progress) {
      useMatchSubscription(match.id, handleEventInsert, handleEventUpdate);
    }
  });

  createEffect(() => {
    const match = currentMatch();
    if (!match?.in_progress || isPaused()) return;

    const yellowScore = countValidGoals(settings.yellowTeam.id);
    const blackScore = countValidGoals(settings.blackTeam.id);

    if (yellowScore < settings.goalsToWin && blackScore < settings.goalsToWin) return;

    void finalizeCurrentMatch(match.id).then((didEnd) => {
      if (didEnd) {
        playSound("win");
      }
    });
  });

  const activeMatch = () => {
    const match = currentMatch();
    return match?.in_progress ? match : null;
  };

  return (
    <HomeShell>
      <Show
        when={activeMatch()}
        keyed
        fallback={
          <MatchSetupPanel
            onStartGame={startGame}
            settings={settings}
            setSettings={setSettings}
            teamOptions={availableTeams() ?? []}
          />
        }
      >
        {(match) => (
          <MatchDashboard
            currentMatch={match}
            elapsedTime={elapsedTime()}
            matchEvents={matchEvents()}
            isPaused={isPaused()}
            leaderboardRefreshKey={leaderboardRefreshKey()}
            onAdjustGoal={adjustGoal}
            onResetGame={resetGame}
            onTogglePause={togglePause}
            settings={settings}
          />
        )}
      </Show>
    </HomeShell>
  );
}

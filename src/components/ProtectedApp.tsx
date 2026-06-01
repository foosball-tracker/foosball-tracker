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

  const countValidGoals = (events: MatchEventRow[], teamId: number | undefined) => {
    if (!teamId) return 0;

    return events.filter(
      (event) =>
        event.type === "goal_detected" && event.status === "valid" && event.team_id === teamId
    ).length;
  };

  const isHydratedMatchComplete = (match: MatchRow, events: MatchEventRow[]) => {
    const yellowGoals = countValidGoals(events, match.home_team_id);
    const blackGoals = countValidGoals(events, match.away_team_id);

    return yellowGoals >= match.goals_to_win || blackGoals >= match.goals_to_win;
  };

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

    const events = await matchService.fetchMatchEvents(match.id);

    if (isHydratedMatchComplete(match, events)) {
      await matchService.endGame(match.id);
      setLeaderboardRefreshKey((value) => value + 1);
      reset();
      setIsPaused(false);
      setMatchEvents([]);
      setCurrentMatch(null);
      return;
    }

    setCurrentMatch(match);
    setMatchEvents(events);
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
      const recordedGoalId = await matchService.recordGoalEvent(
        match.id,
        teamId,
        elapsedTime(),
        matchService.formatGoalTime
      );

      if (!recordedGoalId) return;

      setMatchEvents(await matchService.fetchMatchEvents(match.id));
      return;
    }

    const invalidatedGoalId = await matchService.invalidateLastGoalForTeam(
      match.id,
      teamId,
      "manual correction"
    );
    if (!invalidatedGoalId) return;

    setMatchEvents(await matchService.fetchMatchEvents(match.id));
  };

  let finalizing = false;

  const finalizeCurrentMatch = async (matchId: number) => {
    if (finalizing) return false;
    finalizing = true;

    const didEnd = await matchService.endGame(matchId);
    if (!didEnd) {
      finalizing = false;
      return false;
    }

    stop();
    setIsPaused(false);
    setCurrentMatch((match) => (match ? { ...match, in_progress: false } : match));
    setLeaderboardRefreshKey((value) => value + 1);
    finalizing = false;
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

  const rematch = async () => {
    const match = currentMatch();
    if (!match) return;

    const newMatch = await matchService.createMatch(
      match.home_team_id,
      match.away_team_id,
      match.goals_to_win
    );
    if (!newMatch) {
      alert("Could not start the rematch. Please try again.");
      return;
    }

    reset();
    setCurrentMatch(newMatch);
    setMatchEvents([]);
    setIsPaused(false);
    start();
  };

  const rematchSwitched = async () => {
    const match = currentMatch();
    if (!match) return;

    const newMatch = await matchService.createMatch(
      match.away_team_id,
      match.home_team_id,
      match.goals_to_win
    );
    if (!newMatch) {
      alert("Could not start the rematch. Please try again.");
      return;
    }

    setSettings({
      yellowTeam: { ...settings.blackTeam },
      blackTeam: { ...settings.yellowTeam },
    });

    reset();
    setCurrentMatch(newMatch);
    setMatchEvents([]);
    setIsPaused(false);
    start();
  };

  const newGame = () => {
    stop();
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

    const events = matchEvents();
    const yellowScore = countValidGoals(events, settings.yellowTeam.id);
    const blackScore = countValidGoals(events, settings.blackTeam.id);

    if (yellowScore < settings.goalsToWin && blackScore < settings.goalsToWin) return;

    void finalizeCurrentMatch(match.id).then((didEnd) => {
      if (didEnd) {
        playSound("win");
      }
    });
  });

  const activeMatch = () => currentMatch();
  const isMatchComplete = () => {
    const match = currentMatch();
    return match ? !match.in_progress : false;
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
            isComplete={isMatchComplete()}
            leaderboardRefreshKey={leaderboardRefreshKey()}
            onAdjustGoal={adjustGoal}
            onRematch={rematch}
            onRematchSwitched={rematchSwitched}
            onNewGame={newGame}
            onResetGame={resetGame}
            onTogglePause={togglePause}
            settings={settings}
          />
        )}
      </Show>
    </HomeShell>
  );
}

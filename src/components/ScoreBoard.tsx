import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  CirclePlay,
  Goal,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Timer,
} from "lucide-solid";
import { createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import { GoalHistoryCard } from "~/components/home/GoalHistoryCard.tsx";
import { TeamScore } from "~/components/TeamScore";
import { formatTime } from "~/lib/utils.ts";
import type { ISettings } from "~/types/Settings";
import type { Tables } from "~/types/database";

type MatchEventRow = Tables<"match_events">;
type MatchRow = Tables<"matches">;

interface ScoreBoardProps {
  backendReady: boolean;
  currentMatch: MatchRow;
  elapsedTime: number;
  matchEvents: MatchEventRow[];
  isPaused: boolean;
  isComplete: boolean;
  onAdjustGoal: (teamId: number, increment: number) => Promise<void>;
  onRematch: () => Promise<void>;
  onRematchSwitched: () => Promise<void>;
  onNewGame: () => void;
  onResetGame: () => Promise<void>;
  onTogglePause: () => void;
  settings: Readonly<ISettings>;
}

export function ScoreBoard(props: Readonly<ScoreBoardProps>) {
  const [isFullscreen, setIsFullscreen] = createSignal(false);
  let scoreboardElement: HTMLElement | undefined;

  const yellowScore = createMemo(
    () =>
      props.matchEvents.filter(
        (e) =>
          e.type === "goal_detected" &&
          e.status === "valid" &&
          e.team_id === props.settings.yellowTeam.id
      ).length
  );
  const blackScore = createMemo(
    () =>
      props.matchEvents.filter(
        (e) =>
          e.type === "goal_detected" &&
          e.status === "valid" &&
          e.team_id === props.settings.blackTeam.id
      ).length
  );

  const scoreboardDisabled = () => props.isPaused || props.isComplete || !props.backendReady;
  const yellowTeamName = () => props.settings.yellowTeam.name ?? "Yellow Team";
  const blackTeamName = () => props.settings.blackTeam.name ?? "Black Team";
  const goalsToWin = () => props.settings.goalsToWin || props.currentMatch.goals_to_win;

  const syncFullscreenState = () => {
    setIsFullscreen(document.fullscreenElement === scoreboardElement);
  };

  onMount(() => {
    document.addEventListener("fullscreenchange", syncFullscreenState);
    onCleanup(() => document.removeEventListener("fullscreenchange", syncFullscreenState));
  });

  const toggleFullscreen = async () => {
    if (!document.fullscreenEnabled) return;

    if (document.fullscreenElement === scoreboardElement) {
      await document.exitFullscreen();
      return;
    }

    await scoreboardElement?.requestFullscreen();
  };

  const adjustScore = async (teamId: number | null | undefined, increment: number) => {
    if (!teamId || scoreboardDisabled()) return;
    await props.onAdjustGoal(teamId, increment);
  };

  const scoreControlButton = (
    teamId: number | null | undefined,
    increment: number,
    label: string
  ) => (
    <button
      aria-label={label}
      class="btn btn-ghost btn-circle btn-sm text-base-content h-10 min-h-10 w-10 sm:h-11 sm:w-11"
      disabled={scoreboardDisabled() || !teamId}
      onClick={() => void adjustScore(teamId, increment)}
      type="button"
    >
      {increment > 0 ? (
        <ChevronUp size={24} strokeWidth={3} />
      ) : (
        <ChevronDown size={24} strokeWidth={3} />
      )}
    </button>
  );

  const scoreColumn = (score: number, teamId: number | null | undefined, teamName: string) => (
    <div class="flex min-w-20 flex-col items-center gap-1 sm:min-w-28 sm:gap-2">
      {scoreControlButton(teamId, 1, `Add goal for ${teamName}`)}
      <span class="text-5xl leading-none font-black tabular-nums sm:text-7xl">{score}</span>
      {scoreControlButton(teamId, -1, `Remove goal for ${teamName}`)}
    </div>
  );

  const shellClasses = () =>
    [
      "card border-base-300 bg-base-100 text-base-content shadow-sm [html[data-theme=dim]_&]:bg-neutral [html[data-theme=dim]_&]:text-neutral-content",
      isFullscreen() ? "min-h-screen rounded-none" : "",
    ].join(" ");

  const fullscreenLabel = () =>
    isFullscreen() ? "Exit scoreboard fullscreen" : "Enter scoreboard fullscreen";

  const fullscreenIcon = () => (isFullscreen() ? <Minimize2 size={18} /> : <Maximize2 size={18} />);

  const gameStatusClasses = () => {
    if (props.isComplete) return "badge badge-error gap-2";
    if (props.isPaused) return "badge badge-warning gap-2";
    return "badge badge-success gap-2";
  };

  const gameStatusLabel = () => {
    if (props.isComplete) return "Finished";
    if (props.isPaused) return "Paused";
    return "Live";
  };

  const recentGoalLimit = () => (isFullscreen() ? 4 : 0);

  const goalEvents = createMemo(() => props.matchEvents.filter((e) => e.type === "goal_detected"));

  const actionButtonClasses = (variant: "primary" | "outline" | "subtle") =>
    [
      "btn btn-sm sm:btn-md h-11 min-h-11 w-full justify-center gap-2 rounded-full px-4 text-center sm:min-w-40 sm:w-auto",
      variant === "primary"
        ? "btn-primary"
        : variant === "outline"
          ? "btn-outline"
          : "btn-outline border-base-300 bg-base-100/60 hover:bg-base-100 text-base-content/80 [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:hover:bg-base-100/15",
    ].join(" ");

  const centerScore = () => (
    <div class="border-base-300 bg-base-200 text-base-content [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content rounded-box border px-3 py-2 shadow-sm sm:px-6 sm:py-4">
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-4">
        {scoreColumn(yellowScore(), props.settings.yellowTeam.id, yellowTeamName())}
        <span class="text-base-content/40 [html[data-theme=dim]_&]:text-neutral-content/45 px-1 text-4xl font-black sm:text-5xl">
          -
        </span>
        {scoreColumn(blackScore(), props.settings.blackTeam.id, blackTeamName())}
      </div>
    </div>
  );

  return (
    <section
      class={shellClasses()}
      ref={(element) => {
        scoreboardElement = element;
      }}
    >
      <div class="card-body gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="bg-base-200 text-base-content [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content flex h-9 w-9 items-center justify-center rounded-full">
              <Goal size={20} />
            </div>
            <div>
              <p class="text-base-content/70 [html[data-theme=dim]_&]:text-neutral-content/70 text-xs font-black tracking-[0.24em] uppercase">
                Scoreboard
              </p>
              <p class="text-base-content/75 [html[data-theme=dim]_&]:text-neutral-content/75 text-sm font-bold">
                Target: first to {goalsToWin()} goals
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class={gameStatusClasses()}>
              <span class="h-2 w-2 rounded-full bg-current" />
              {gameStatusLabel()}
            </span>
            <button
              aria-label={fullscreenLabel()}
              class="btn btn-ghost btn-square btn-sm"
              disabled={!document.fullscreenEnabled}
              onClick={() => void toggleFullscreen()}
              type="button"
            >
              {fullscreenIcon()}
            </button>
          </div>
        </div>

        <div class="grid items-center gap-4 sm:gap-5">
          <div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 sm:gap-5">
            <TeamScore team="yellow" teamName={yellowTeamName()} />
            <div class="bg-base-200 text-base-content [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content rounded-full px-3 py-2 text-xs font-black tracking-[0.18em] uppercase">
              VS
            </div>
            <TeamScore team="black" teamName={blackTeamName()} />
          </div>

          <div class="mx-auto w-full max-w-lg">{centerScore()}</div>
        </div>

        <div class="border-base-300 bg-base-200 [html[data-theme=dim]_&]:bg-base-100/10 rounded-box flex flex-col items-center justify-between gap-3 border p-3 sm:flex-row sm:p-4">
          <div class="flex items-center gap-3">
            <div class="bg-base-100 text-base-content flex h-10 w-10 items-center justify-center rounded-full">
              <Timer size={20} />
            </div>
            <div>
              <p class="text-base-content/70 [html[data-theme=dim]_&]:text-neutral-content/70 text-xs font-black tracking-[0.18em] uppercase">
                {props.isComplete ? "Final Time" : "Match Time"}
              </p>
              <p class="text-2xl leading-none font-black tabular-nums sm:text-3xl">
                {formatTime(props.elapsedTime)}
              </p>
            </div>
          </div>

          <Show
            when={props.isComplete}
            fallback={
              <div class="grid w-full gap-2 sm:flex sm:flex-wrap sm:justify-center">
                <button
                  class={actionButtonClasses("primary")}
                  disabled={!props.backendReady}
                  onClick={() => props.onTogglePause()}
                  type="button"
                >
                  {props.isPaused ? <Play size={18} /> : <Pause size={18} />}
                  {props.isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  class={actionButtonClasses("subtle")}
                  disabled={!props.backendReady}
                  onClick={() => void props.onResetGame()}
                  type="button"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>
            }
          >
            <div class="grid w-full gap-2 sm:grid-cols-2">
              <button
                class={actionButtonClasses("primary")}
                onClick={() => void props.onRematch()}
                type="button"
              >
                <RefreshCw size={18} />
                Rematch
              </button>
              <button
                class={actionButtonClasses("outline")}
                onClick={() => void props.onRematchSwitched()}
                type="button"
              >
                <ArrowLeftRight size={18} />
                Rematch + swap sides
              </button>
              <button
                class={`${actionButtonClasses("subtle")} sm:col-span-2 sm:mx-auto`}
                onClick={() => props.onNewGame()}
                type="button"
              >
                <CirclePlay size={18} />
                New game
              </button>
            </div>
          </Show>
        </div>

        {isFullscreen() && (
          <div class="border-base-300 bg-base-200 rounded-box [html[data-theme=dim]_&]:bg-base-100/10 border p-3 sm:p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div>
                <p class="text-base-content/70 [html[data-theme=dim]_&]:text-neutral-content/70 text-xs font-black tracking-[0.18em] uppercase">
                  Recent Goals
                </p>
                <p class="text-base-content/80 [html[data-theme=dim]_&]:text-neutral-content/85 text-sm font-semibold">
                  Latest score changes
                </p>
              </div>
              <span class="badge badge-outline badge-sm border-base-300 bg-base-100 [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content">
                {Math.min(goalEvents().length, recentGoalLimit())} shown
              </span>
            </div>
            <div class="max-h-64 overflow-y-auto pr-1">
              <GoalHistoryCard
                blackTeamId={props.settings.blackTeam.id}
                blackTeamName={blackTeamName()}
                events={goalEvents()}
                maxItems={recentGoalLimit()}
                showHeader={false}
                yellowTeamId={props.settings.yellowTeam.id}
                yellowTeamName={yellowTeamName()}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

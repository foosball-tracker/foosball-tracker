import {
  ChevronDown,
  ChevronUp,
  Goal,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Timer,
} from "lucide-solid";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { TeamScore } from "~/components/TeamScore";
import { formatTime } from "~/lib/utils.ts";
import type { ISettings } from "~/types/Settings";
import type { Tables } from "~/types/database";

type GoalRow = Tables<"goals">;
type MatchRow = Tables<"matches">;

interface ScoreBoardProps {
  currentMatch: MatchRow;
  elapsedTime: number;
  goals: GoalRow[];
  isPaused: boolean;
  onAdjustGoal: (teamId: number, increment: number) => Promise<void>;
  onResetGame: () => Promise<void>;
  onTogglePause: () => void;
  settings: Readonly<ISettings>;
}

export function ScoreBoard(props: Readonly<ScoreBoardProps>) {
  const [isFullscreen, setIsFullscreen] = createSignal(false);
  let scoreboardElement: HTMLElement | undefined;

  const yellowScore = createMemo(
    () => props.goals.filter((goal) => goal.team_id === props.settings.yellowTeam.id).length
  );
  const blackScore = createMemo(
    () => props.goals.filter((goal) => goal.team_id === props.settings.blackTeam.id).length
  );

  const scoreboardDisabled = () => props.isPaused;
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
      class="btn btn-ghost btn-circle btn-sm text-base-content"
      disabled={scoreboardDisabled() || !teamId}
      onClick={() => void adjustScore(teamId, increment)}
      type="button"
    >
      {increment > 0 ? (
        <ChevronUp size={28} strokeWidth={3} />
      ) : (
        <ChevronDown size={28} strokeWidth={3} />
      )}
    </button>
  );

  const scoreColumn = (score: number, teamId: number | null | undefined, teamName: string) => (
    <div class="flex min-w-24 flex-col items-center gap-2 sm:min-w-32">
      {scoreControlButton(teamId, 1, `Add goal for ${teamName}`)}
      <span class="text-7xl leading-none font-black sm:text-8xl">{score}</span>
      {scoreControlButton(teamId, -1, `Remove goal for ${teamName}`)}
    </div>
  );

  const shellClasses = () =>
    [
      "card border-base-300 bg-base-300 text-base-content shadow-sm",
      isFullscreen() ? "min-h-screen rounded-none" : "",
    ].join(" ");

  const fullscreenLabel = () =>
    isFullscreen() ? "Exit scoreboard fullscreen" : "Enter scoreboard fullscreen";

  const fullscreenIcon = () => (isFullscreen() ? <Minimize2 size={18} /> : <Maximize2 size={18} />);

  const gameStatusClasses = () =>
    props.isPaused ? "badge badge-warning gap-2" : "badge badge-success gap-2";

  const centerScore = () => (
    <div class="border-base-300 bg-base-100 text-base-content rounded-[2rem] border px-5 py-4 shadow-xl sm:px-8 sm:py-6">
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-5">
        {scoreColumn(yellowScore(), props.settings.yellowTeam.id, yellowTeamName())}
        <span class="px-1 text-5xl font-black opacity-40 sm:text-6xl">-</span>
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
      <div class="card-body gap-8 p-4 sm:p-6 lg:p-8">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="bg-base-100 text-base-content flex h-10 w-10 items-center justify-center rounded-full shadow-sm">
              <Goal size={20} />
            </div>
            <div>
              <p class="text-xs font-black tracking-[0.28em] uppercase opacity-60">Scoreboard</p>
              <p class="text-sm font-bold opacity-70">Target: first to {goalsToWin()} goals</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class={gameStatusClasses()}>
              <span class="h-2 w-2 rounded-full bg-current" />
              {props.isPaused ? "Paused" : "Live"}
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

        <div class="grid items-center gap-6">
          <div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-6">
            <TeamScore team="yellow" teamName={yellowTeamName()} />
            <div class="bg-base-100 rounded-full px-3 py-2 text-xs font-black tracking-[0.22em] uppercase shadow-sm">
              VS
            </div>
            <TeamScore team="black" teamName={blackTeamName()} />
          </div>

          <div class="mx-auto w-full max-w-xl">{centerScore()}</div>
        </div>

        <div class="bg-base-100/75 flex flex-col items-center justify-between gap-4 rounded-[2rem] p-4 shadow-sm sm:flex-row">
          <div class="flex items-center gap-3">
            <div class="bg-base-200 flex h-12 w-12 items-center justify-center rounded-full">
              <Timer size={22} />
            </div>
            <div>
              <p class="text-xs font-black tracking-[0.24em] uppercase opacity-60">Match Time</p>
              <p class="text-3xl font-black tabular-nums">{formatTime(props.elapsedTime)}</p>
            </div>
          </div>

          <div class="flex flex-wrap justify-center gap-2">
            <button
              class="btn btn-primary rounded-full"
              onClick={() => props.onTogglePause()}
              type="button"
            >
              {props.isPaused ? <Play size={18} /> : <Pause size={18} />}
              {props.isPaused ? "Resume" : "Pause"}
            </button>
            <button
              class="btn btn-ghost rounded-full"
              onClick={() => void props.onResetGame()}
              type="button"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Expand, Goal, Pause, Play, RotateCcw, Timer } from "lucide-solid";
import { createMemo, createSignal } from "solid-js";
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

  const yellowScore = createMemo(
    () => props.goals.filter((goal) => goal.team_id === props.settings.yellowTeam.id).length
  );
  const blackScore = createMemo(
    () => props.goals.filter((goal) => goal.team_id === props.settings.blackTeam.id).length
  );

  const scoreboardDisabled = () => props.isPaused;

  const toggleFullscreen = async () => {
    if (!document.fullscreenEnabled) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
      return;
    }

    await document.documentElement.requestFullscreen();
    setIsFullscreen(true);
  };

  return (
    <section class="card border-base-300 bg-base-100 shadow-sm">
      <div class="card-body gap-6 p-5 sm:p-6 lg:p-8">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <div class="bg-neutral text-neutral-content rounded-full p-2">
                <Goal class="h-4 w-4" />
              </div>
              <p class="text-base-content/60 text-xs font-semibold tracking-[0.24em] uppercase">
                Scoreboard
              </p>
            </div>
            <h2 class="text-2xl font-black tracking-tight sm:text-3xl">Main screen live board</h2>
            <p class="text-base-content/70 text-sm sm:text-base">
              First to {props.currentMatch.goals_to_win} goals wins this round.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              class="btn btn-ghost btn-sm"
              onClick={toggleFullscreen}
              type="button"
              aria-label={
                isFullscreen() ? "Exit fullscreen scoreboard" : "Open fullscreen scoreboard"
              }
            >
              <Expand class="h-4 w-4" />
              <span class="hidden sm:inline">{isFullscreen() ? "Exit" : "Fullscreen"}</span>
            </button>
            <button
              class="btn btn-soft btn-error btn-sm"
              onClick={() => void props.onResetGame()}
              type="button"
            >
              <RotateCcw class="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 text-lg font-black tracking-tight sm:text-2xl">
          <Goal class="h-5 w-5" />
          <span>{props.currentMatch.goals_to_win} goals</span>
        </div>

        <div class="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div class="flex justify-center lg:justify-end">
            <TeamScore
              disabled={scoreboardDisabled()}
              score={yellowScore()}
              team="yellow"
              teamName={props.settings.yellowTeam.name ?? "Yellow Team"}
              updateScore={(increment) =>
                props.onAdjustGoal(props.settings.yellowTeam.id!, increment)
              }
            />
          </div>

          <div class="rounded-box bg-neutral text-neutral-content flex min-w-[12rem] flex-col items-center justify-center gap-3 px-6 py-8 shadow-sm">
            <div class="text-neutral-content/60 flex w-full items-center justify-between text-lg">
              <span aria-hidden="true">^</span>
              <span aria-hidden="true">^</span>
            </div>
            <div class="flex items-center justify-center gap-4 text-6xl font-black tracking-tight sm:text-7xl">
              <span>{yellowScore()}</span>
              <span>-</span>
              <span>{blackScore()}</span>
            </div>
            <div class="text-neutral-content/60 flex w-full items-center justify-between text-lg">
              <span aria-hidden="true">˅</span>
              <span aria-hidden="true">˅</span>
            </div>
          </div>

          <div class="flex justify-center lg:justify-start">
            <TeamScore
              disabled={scoreboardDisabled()}
              score={blackScore()}
              team="black"
              teamName={props.settings.blackTeam.name ?? "Black Team"}
              updateScore={(increment) =>
                props.onAdjustGoal(props.settings.blackTeam.id!, increment)
              }
            />
          </div>
        </div>

        <div class="flex flex-col items-center gap-3 pt-2">
          <div class="flex items-center gap-2 text-lg font-black tracking-tight sm:text-2xl">
            <Timer class="h-5 w-5" />
            <span>{formatTime(props.elapsedTime)}</span>
          </div>

          <button
            class="btn btn-ghost gap-2 text-lg font-black"
            onClick={() => props.onTogglePause()}
            type="button"
          >
            {props.isPaused ? <Play class="h-5 w-5" /> : <Pause class="h-5 w-5" />}
            {props.isPaused ? "Resume" : "Pause"}
          </button>
        </div>
      </div>
    </section>
  );
}

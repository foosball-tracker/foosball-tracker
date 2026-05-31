import { For, createMemo } from "solid-js";
import { History } from "lucide-solid";
import type { Tables } from "~/types/database";

type GoalRow = Tables<"goals">;

interface GoalHistoryCardProps {
  blackTeamId?: number;
  blackTeamName: string;
  goals: GoalRow[];
  yellowTeamId?: number;
  yellowTeamName: string;
}

interface GoalHistoryRow {
  id: number;
  scoreLabel: string;
  teamLabel: string;
  teamTone: string;
  timeLabel: string;
}

export function GoalHistoryCard(props: Readonly<GoalHistoryCardProps>) {
  const rows = createMemo<GoalHistoryRow[]>(() => {
    let yellowScore = 0;
    let blackScore = 0;

    return props.goals.map((goal) => {
      const isYellow = goal.team_id === props.yellowTeamId;

      if (isYellow) {
        yellowScore += 1;
      } else {
        blackScore += 1;
      }

      return {
        id: goal.id,
        scoreLabel: `${yellowScore} - ${blackScore}`,
        teamLabel: isYellow ? props.yellowTeamName : props.blackTeamName,
        teamTone: isYellow ? "badge-warning" : "badge-neutral",
        timeLabel: goal.goal_time.replace(/^00:/, ""),
      };
    });
  });

  return (
    <section class="card border-base-300 bg-base-100 text-base-content [html[data-theme=dim]_&]:bg-neutral [html[data-theme=dim]_&]:text-neutral-content shadow-sm">
      <div class="card-body gap-4 p-4 sm:gap-5 sm:p-6">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="bg-base-200 text-base-content [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content rounded-full p-2">
              <History class="h-4 w-4" />
            </div>
            <div>
              <h3 class="text-lg font-black tracking-tight sm:text-xl">Goal history</h3>
              <p class="text-base-content/75 [html[data-theme=dim]_&]:text-neutral-content/75 text-sm">
                Every goal, with live score progression
              </p>
            </div>
          </div>
          <span class="badge badge-neutral [html[data-theme=dim]_&]:bg-neutral-content [html[data-theme=dim]_&]:text-neutral">
            {rows().length} events
          </span>
        </div>

        <div class="rounded-box bg-base-200 text-base-content [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content hidden grid-cols-[minmax(0,1.4fr)_auto_auto] gap-4 px-4 py-3 text-xs font-semibold tracking-[0.18em] uppercase md:grid">
          <span>Scoring side</span>
          <span>Clock</span>
          <span>Score</span>
        </div>

        <div class="space-y-2 sm:space-y-3">
          <For
            each={rows()}
            fallback={
              <div class="rounded-box bg-base-200 text-base-content/75 [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content/80 p-4 text-sm">
                No goals recorded yet. Start the match and the timeline will build itself from the
                live score feed.
              </div>
            }
          >
            {(row) => (
              <div class="rounded-box border-base-300 bg-base-200 [html[data-theme=dim]_&]:bg-base-100/10 grid gap-2 border px-3 py-3 sm:px-4 md:grid-cols-[minmax(0,1.4fr)_auto_auto] md:items-center md:gap-4">
                <div class="min-w-0">
                  <span
                    class={`badge ${row.teamTone} max-w-full justify-start truncate border-transparent font-bold`}
                  >
                    {row.teamLabel}
                  </span>
                </div>
                <span class="text-base-content/80 [html[data-theme=dim]_&]:text-neutral-content/85 text-sm font-bold tabular-nums">
                  {row.timeLabel}
                </span>
                <span class="text-xl leading-none font-black tracking-tight tabular-nums">
                  {row.scoreLabel}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  );
}

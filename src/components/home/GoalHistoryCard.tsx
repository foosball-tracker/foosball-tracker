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
    <section class="card border-base-300 bg-base-100 shadow-sm">
      <div class="card-body gap-5 p-5 sm:p-6">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="bg-neutral text-neutral-content rounded-full p-2">
              <History class="h-4 w-4" />
            </div>
            <div>
              <h3 class="text-xl font-black tracking-tight">Goal history</h3>
              <p class="text-base-content/60 text-sm">Every goal, with live score progression</p>
            </div>
          </div>
          <span class="badge badge-outline">{rows().length} events</span>
        </div>

        <div class="rounded-box bg-neutral text-neutral-content hidden grid-cols-[minmax(0,1.4fr)_auto_auto] gap-4 px-5 py-4 text-xs font-semibold tracking-[0.24em] uppercase md:grid">
          <span>Scoring side</span>
          <span>Clock</span>
          <span>Score</span>
        </div>

        <div class="space-y-3">
          <For
            each={rows()}
            fallback={
              <div class="rounded-box bg-base-200 text-base-content/70 p-6 text-sm">
                No goals recorded yet. Start the match and the timeline will build itself from the
                live score feed.
              </div>
            }
          >
            {(row) => (
              <div class="rounded-box bg-base-200 grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.4fr)_auto_auto] md:items-center md:gap-4">
                <div class="flex items-center gap-3">
                  <span class={`badge ${row.teamTone} badge-outline`}>{row.teamLabel}</span>
                </div>
                <span class="text-base-content/70 text-sm font-medium">{row.timeLabel}</span>
                <span class="text-lg font-black tracking-tight">{row.scoreLabel}</span>
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  );
}

import { For, Show, createMemo } from "solid-js";
import { History } from "lucide-solid";
import type { Tables } from "~/types/database";

type GoalRow = Tables<"goals">;

interface GoalHistoryCardProps {
  blackTeamId?: number;
  blackTeamName: string;
  goals: GoalRow[];
  maxItems?: number;
  showHeader?: boolean;
  yellowTeamId?: number;
  yellowTeamName: string;
}

interface GoalHistoryRow {
  id: number;
  eventLabel: string;
  scoreLabel: string;
  teamLabel: string;
  teamTone: "yellow" | "black";
  timeLabel: string;
}

export function GoalHistoryCard(props: Readonly<GoalHistoryCardProps>) {
  const rows = createMemo<GoalHistoryRow[]>(() => {
    let yellowScore = 0;
    let blackScore = 0;

    const mappedRows = props.goals.map((goal, index) => {
      const isYellow = goal.team_id === props.yellowTeamId;

      if (isYellow) {
        yellowScore += 1;
      } else {
        blackScore += 1;
      }

      return {
        id: goal.id,
        eventLabel: `#${index + 1}`,
        scoreLabel: `${yellowScore} - ${blackScore}`,
        teamLabel: isYellow ? props.yellowTeamName : props.blackTeamName,
        teamTone: isYellow ? ("yellow" as const) : ("black" as const),
        timeLabel: goal.goal_time.replace(/^00:/, ""),
      };
    });

    const newestFirstRows = [...mappedRows].reverse();

    return props.maxItems ? newestFirstRows.slice(0, props.maxItems) : newestFirstRows;
  });

  const eventCountLabel = createMemo(() => {
    const eventCount = props.goals.length;
    return `${eventCount} ${eventCount === 1 ? "event" : "events"}`;
  });

  const shellClass = () =>
    props.showHeader === false
      ? "space-y-2 sm:space-y-3"
      : "card border-base-300 bg-base-100 text-base-content shadow-sm [html[data-theme=dim]_&]:bg-neutral [html[data-theme=dim]_&]:text-neutral-content";

  const bodyClass = () =>
    props.showHeader === false ? "space-y-2 sm:space-y-3" : "card-body gap-4 p-4 sm:gap-5 sm:p-6";

  return (
    <section class={shellClass()}>
      <div class={bodyClass()}>
        <Show when={props.showHeader !== false}>
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="bg-base-200 text-base-content [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content rounded-full p-2">
                <History class="h-4 w-4" />
              </div>
              <h3 class="text-lg font-black tracking-tight sm:text-xl">Goal history</h3>
            </div>
            <span class="badge badge-outline badge-sm border-base-300 bg-base-100 [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content px-3 py-3 text-[0.7rem] font-bold tracking-[0.1em] whitespace-nowrap uppercase">
              {eventCountLabel()}
            </span>
          </div>
        </Show>

        <Show when={rows().length > 0}>
          <div class="rounded-box border-base-300 bg-base-200/80 text-base-content [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content/80 hidden grid-cols-[auto_minmax(0,1.4fr)_auto_auto] gap-3 border px-3 py-2 text-[0.68rem] font-black tracking-[0.18em] uppercase sm:grid">
            <span>Event</span>
            <span>Scoring side</span>
            <span>Clock</span>
            <span>Score</span>
          </div>
        </Show>

        <div class="space-y-2 sm:space-y-3">
          <For
            each={rows()}
            fallback={
              <div class="rounded-box border-base-300 bg-base-200 text-base-content/80 [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content/85 p-4 text-sm">
                No goals recorded yet. Start the match and the timeline will build itself from the
                live score feed.
              </div>
            }
          >
            {(row) => (
              <div class="rounded-box border-base-300 bg-base-200 [html[data-theme=dim]_&]:bg-base-100/10 grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border px-3 py-3 shadow-sm sm:grid-cols-[auto_minmax(0,1.4fr)_auto_auto] sm:items-center sm:px-4">
                <div class="bg-base-100 text-base-content [html[data-theme=dim]_&]:bg-neutral-content/10 [html[data-theme=dim]_&]:text-neutral-content flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-[0.7rem] font-black tracking-[0.14em] uppercase tabular-nums shadow-sm">
                  {row.eventLabel}
                </div>
                <div class="flex min-w-0 items-center gap-2">
                  <span
                    class={`h-3 w-3 shrink-0 rounded-full border ${
                      row.teamTone === "yellow"
                        ? "border-warning bg-warning"
                        : "border-neutral-content/45 bg-neutral [html[data-theme=dim]_&]:border-neutral-content/70 [html[data-theme=dim]_&]:bg-neutral-content"
                    }`}
                  />
                  <span
                    class={`badge max-w-full flex-1 justify-start truncate border px-3 font-bold ${
                      row.teamTone === "yellow"
                        ? "border-warning/40 bg-warning/20 text-warning-content [html[data-theme=dim]_&]:border-warning/50 [html[data-theme=dim]_&]:bg-warning/18 [html[data-theme=dim]_&]:text-warning"
                        : "border-neutral-content/20 bg-neutral text-neutral-content [html[data-theme=dim]_&]:border-neutral-content/30 [html[data-theme=dim]_&]:bg-neutral-content/12 [html[data-theme=dim]_&]:text-neutral-content"
                    }`}
                  >
                    {row.teamLabel}
                  </span>
                </div>
                <span class="text-base-content/85 [html[data-theme=dim]_&]:text-neutral-content/90 text-right text-sm font-bold tabular-nums sm:text-left">
                  {row.timeLabel}
                </span>
                <span class="[html[data-theme=dim]_&]:text-neutral-content col-start-2 text-lg leading-none font-black tracking-tight tabular-nums sm:col-start-auto sm:text-xl">
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

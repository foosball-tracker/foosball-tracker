import { createResource, createSignal, For, Show } from "solid-js";
import { Trophy } from "lucide-solid";
import {
  getLeaderboardSnapshot,
  type PlayerLeaderboardRow,
  type TeamLeaderboardRow,
} from "~/service/leaderboardService.ts";

interface LeaderboardCardProps {
  refreshKey: number;
}

export function LeaderboardCard(props: Readonly<LeaderboardCardProps>) {
  const [activeTab, setActiveTab] = createSignal<"teams" | "players">("teams");
  const [snapshot] = createResource(() => props.refreshKey, getLeaderboardSnapshot);

  const rows = () =>
    activeTab() === "teams" ? (snapshot()?.teams ?? []) : (snapshot()?.players ?? []);

  return (
    <section class="card border-base-300 bg-base-100 text-base-content [html[data-theme=dim]_&]:bg-neutral [html[data-theme=dim]_&]:text-neutral-content h-full shadow-sm">
      <div class="card-body gap-4 p-4 sm:gap-5 sm:p-6">
        <div class="flex items-center gap-3">
          <div class="bg-base-200 text-base-content [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content rounded-full p-2">
            <Trophy class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-lg font-black tracking-tight sm:text-xl">Leaderboard</h3>
            <p class="text-base-content/75 [html[data-theme=dim]_&]:text-neutral-content/75 text-sm">
              Wins from completed matches
            </p>
          </div>
        </div>

        <div
          role="tablist"
          class="tabs tabs-box bg-base-200 [html[data-theme=dim]_&]:bg-base-100/10 w-full max-w-xs"
        >
          <button
            class={`tab flex-1 ${activeTab() === "teams" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("teams")}
            role="tab"
            aria-selected={activeTab() === "teams"}
          >
            Teams
          </button>
          <button
            class={`tab flex-1 ${activeTab() === "players" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("players")}
            role="tab"
            aria-selected={activeTab() === "players"}
          >
            Players
          </button>
        </div>

        <Show
          when={!snapshot.loading}
          fallback={
            <div class="space-y-3">
              <div class="skeleton h-12 w-full" />
              <div class="skeleton h-12 w-full" />
              <div class="skeleton h-12 w-full" />
            </div>
          }
        >
          <div class="space-y-3">
            <div class="text-base-content/70 [html[data-theme=dim]_&]:text-neutral-content/75 hidden grid-cols-[minmax(0,1fr)_auto] gap-4 px-3 text-xs font-semibold tracking-[0.18em] uppercase sm:grid">
              <span>Name</span>
              <span>Wins</span>
            </div>

            <For
              each={rows() as (TeamLeaderboardRow | PlayerLeaderboardRow)[]}
              fallback={
                <div class="rounded-box bg-base-200 text-base-content/75 [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content/80 p-4 text-sm">
                  No completed matches yet. Finish a game to populate the rankings.
                </div>
              }
            >
              {(row, index) => (
                <div class="rounded-box border-base-300 bg-base-200 [html[data-theme=dim]_&]:bg-base-100/10 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border px-3 py-3 sm:px-4">
                  <div class="bg-base-100 text-base-content flex h-9 w-9 items-center justify-center rounded-full text-sm font-black">
                    {index() + 1}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-semibold">{row.name}</p>
                    {"type" in row && (
                      <p class="text-base-content/70 [html[data-theme=dim]_&]:text-neutral-content/75 text-xs tracking-[0.18em] uppercase">
                        {row.type}
                      </p>
                    )}
                  </div>
                  <span class="text-lg font-black tracking-tight">{row.wins}</span>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </section>
  );
}

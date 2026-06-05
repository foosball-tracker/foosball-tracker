import { createMemo, createResource, createSignal, Show } from "solid-js";
import { type ColumnDef } from "@tanstack/solid-table";
import { Shield, Users } from "lucide-solid";
import {
  getLeaderboardSnapshot,
  type PlayerLeaderboardRow,
  type TeamLeaderboardRow,
} from "~/service/leaderboardService.ts";
import { DataTable } from "~/components/shared/table/DataTable.tsx";

type LeaderboardTab = "teams" | "players";

interface LeaderboardContentProps {
  refreshKey?: number;
}

export function LeaderboardContent(props: Readonly<LeaderboardContentProps>) {
  const [activeTab, setActiveTab] = createSignal<LeaderboardTab>("teams");
  const [snapshot] = createResource(() => props.refreshKey ?? 0, getLeaderboardSnapshot);

  const rows = createMemo(() =>
    activeTab() === "teams" ? (snapshot()?.teams ?? []) : (snapshot()?.players ?? [])
  );

  const columns = createMemo<ColumnDef<TeamLeaderboardRow | PlayerLeaderboardRow>[]>(() => [
    {
      id: "rank",
      header: "Rank",
      cell: (info) => {
        const rank = info.row.index + 1;

        return (
          <div class="bg-base-200 text-base-content flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black">
            {rank}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: activeTab() === "teams" ? "Team" : "Player",
      cell: (info) => {
        const row = info.row.original;

        return (
          <div class="min-w-0">
            <p class="truncate font-semibold">{row.name}</p>
            <div class="mt-1 flex flex-wrap gap-1.5">
              <Show when={"type" in row}>
                <span class="badge badge-outline badge-sm gap-1">
                  <Shield class="h-3 w-3" />
                  Team
                </span>
              </Show>
              <Show when={!("type" in row)}>
                <span class="badge badge-outline badge-sm gap-1">
                  <Users class="h-3 w-3" />
                  Player
                </span>
              </Show>
              <span class="badge badge-outline badge-sm sm:hidden">
                {info.row.original.wins} wins
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "wins",
      header: "Wins",
      meta: {
        headerClass: "hidden text-right sm:table-cell",
        cellClass: "hidden text-right sm:table-cell",
      },
      cell: (info) => (
        <span class="text-lg font-black tracking-tight">{info.row.original.wins}</span>
      ),
    },
  ]);

  return (
    <div class="space-y-4">
      <div
        role="tablist"
        class="tabs tabs-box bg-base-200 [html[data-theme=dim]_&]:bg-base-100/10 w-full sm:w-fit"
      >
        <button
          class={`tab flex-1 sm:flex-initial ${activeTab() === "teams" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("teams")}
          role="tab"
          aria-selected={activeTab() === "teams"}
        >
          Teams
        </button>
        <button
          class={`tab flex-1 sm:flex-initial ${activeTab() === "players" ? "tab-active" : ""}`}
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
        <DataTable
          columns={columns()}
          data={rows() as (TeamLeaderboardRow | PlayerLeaderboardRow)[]}
          emptyTitle="No completed matches yet"
          emptyDescription="Finish a game to populate the current standings."
        />
      </Show>
    </div>
  );
}

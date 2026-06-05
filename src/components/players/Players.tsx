import { A } from "@solidjs/router";
import type { RouteSectionProps } from "@solidjs/router";
import { ColumnDef } from "@tanstack/solid-table";
import { Users } from "lucide-solid";
import { createResource, createSignal, Show } from "solid-js";
import { hasSupabaseConfig, supabase } from "~/service/supabaseService.ts";
import { DataTable } from "~/components/shared/table/DataTable.tsx";
import { TableSection } from "~/components/shared/table/TableSection.tsx";
import ConfirmDelete from "./ConfirmDelete";
import { PlayerListContext } from "./PlayerListContext";

interface Player {
  id: number;
  name: string;
}

const [showConfirm, setShowConfirm] = createSignal(false);
const [playerToDelete, setPlayerToDelete] = createSignal<Player | null>(null);

const openDeleteConfirm = (player: Player) => {
  setPlayerToDelete(player);
  setShowConfirm(true);
};

const getPlayerInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const columns: ColumnDef<Player>[] = [
  {
    accessorKey: "name",
    header: "Player",
    cell: (info) => {
      const player = info.row.original;

      return (
        <div class="min-w-0 space-y-3">
          <div class="flex min-w-0 items-center gap-3">
            <div class="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              {getPlayerInitials(player.name)}
            </div>
            <div class="min-w-0">
              <p class="truncate font-semibold">{player.name}</p>
              <p class="text-base-content/65 text-sm">
                Available for teams, matches, and standings.
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:hidden">
            <span class="badge badge-outline badge-sm">Match roster</span>
            <span class="badge badge-outline badge-sm">Team eligible</span>
            <button
              class="btn btn-soft btn-error btn-xs ml-auto"
              onClick={() => openDeleteConfirm(player)}
            >
              Delete
            </button>
          </div>
        </div>
      );
    },
  },
  {
    header: "Usage",
    meta: {
      headerClass: "hidden sm:table-cell",
      cellClass: "hidden sm:table-cell",
    },
    cell: () => (
      <div class="flex flex-wrap gap-2">
        <span class="badge badge-outline badge-sm">Match roster</span>
        <span class="badge badge-outline badge-sm">Team eligible</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    meta: {
      headerClass: "hidden text-right sm:table-cell",
      cellClass: "hidden w-0 text-right sm:table-cell",
    },
    cell: (info) => {
      const player = info.row.original;

      return (
        <button
          class="btn btn-soft btn-error btn-sm min-w-24"
          onClick={() => openDeleteConfirm(player)}
        >
          Delete
        </button>
      );
    },
  },
];

const getPlayers = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("players").select();
  if (error) {
    console.error("error fetching players", error);
  }
  return data ?? [];
};

function Players(props: RouteSectionProps) {
  const [data, { refetch }] = createResource(getPlayers);

  return (
    <Show
      when={hasSupabaseConfig()}
      fallback={
        <div class="alert alert-info m-4">
          <span>Supabase is not configured. Player management is unavailable.</span>
        </div>
      }
    >
      <PlayerListContext.Provider value={{ refetchPlayers: refetch }}>
        <div class="h-full px-4 py-4 sm:px-6">
          <Show
            when={data()}
            keyed
            fallback={
              <div class="flex h-full items-center justify-center">
                <span class="loading loading-spinner loading-xl" />
              </div>
            }
          >
            {(resolvedData) => (
              <TableSection
                eyebrow="Roster"
                title="Players"
                description="Manage the people available for match setup. The table structure leaves room for future stats without changing the surrounding page."
                stats={
                  <span class="badge badge-outline badge-sm gap-2 px-3 py-3">
                    <Users class="h-3.5 w-3.5" />
                    {resolvedData.length} {resolvedData.length === 1 ? "player" : "players"}
                  </span>
                }
                actions={
                  <A class="btn btn-primary btn-sm sm:btn-md min-w-40" href="/players/new">
                    Create New Player
                  </A>
                }
              >
                <DataTable
                  columns={columns}
                  data={resolvedData}
                  emptyTitle="No players yet"
                  emptyDescription="Create a player to start building teams and tracking matches."
                />
              </TableSection>
            )}
          </Show>
        </div>

        {props.children}

        <ConfirmDelete
          showConfirm={showConfirm()}
          playerToDelete={playerToDelete()}
          onCancel={() => {
            setShowConfirm(false);
            setPlayerToDelete(null);
          }}
          onSuccess={() => {
            refetch();
          }}
        />
      </PlayerListContext.Provider>
    </Show>
  );
}

export default Players;

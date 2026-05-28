import { A } from "@solidjs/router";
import type { RouteSectionProps } from "@solidjs/router";
import { ColumnDef } from "@tanstack/solid-table";
import { createResource, createSignal, Show } from "solid-js";
import { hasSupabaseConfig, supabase } from "~/service/supabaseService.ts";
import { DataTable } from "~/components/shared/table/DataTable.tsx";
import ConfirmDelete from "./ConfirmDelete";
import { PlayerListContext } from "./PlayerListContext";

interface Player {
  id: number;
  name: string;
}

const [showConfirm, setShowConfirm] = createSignal(false);
const [playerToDelete, setPlayerToDelete] = createSignal<Player | null>(null);

const columns: ColumnDef<Player>[] = [
  {
    header: "Actions",
    cell: (info) => {
      const player = info.row.original;
      return (
        <button
          class="btn btn-error btn-sm"
          onClick={() => {
            setPlayerToDelete(player);
            setShowConfirm(true);
          }}
        >
          Delete
        </button>
      );
    },
  },
  {
    header: "Name",
    accessorKey: "name",
    cell: (info) => info.getValue(),
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
        <div class="h-full px-4 py-2">
          <Show
            when={data()}
            keyed
            fallback={
              <div class="flex h-full items-center justify-center">
                <span class="loading loading-spinner loading-xl" />
              </div>
            }
          >
            {(resolvedData) => <DataTable columns={columns} data={resolvedData} />}
          </Show>
          <div class="mt-4 text-center">
            <A class="btn btn-primary" href="/players/new">
              Create New Player
            </A>
          </div>
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

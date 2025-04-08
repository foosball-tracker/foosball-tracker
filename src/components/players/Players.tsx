import { ColumnDef } from "@tanstack/solid-table";
import { createResource, createSignal, Show } from "solid-js";
import { supabase } from "~/service/supabaseService.ts";
import { DataTable } from "~/components/shared/table/DataTable.tsx";
import PlayerForm from "./PlayerForm";
import ConfirmDelete from "./ConfirmDelete";

// Define the Person type
interface Player {
  id: number;
  name: string;
}
const [showCreateForm, setShowCreateForm] = createSignal(false);
const [showConfirm, setShowConfirm] = createSignal(false);
const [playerToDelete, setPlayerToDelete] = createSignal<Player | null>(null);

// Define columns, including custom cells for a checkbox and an action button.
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
  const { data, error } = await supabase.from("players").select();
  if (error) {
    console.error("error fetching players", error);
  }
  return data ?? [];
};

function Players() {
  const [data, { refetch }] = createResource(getPlayers);

  const handleCreatePlayerSuccess = () => {
    refetch();
    setTimeout(() => {
      setShowCreateForm(false);
    }, 1000);
  };

  return (
    <>
      <Show
        when={!showCreateForm()}
        keyed
        fallback={<PlayerForm onSuccess={handleCreatePlayerSuccess} />}
      >
        <div class="h-full p-2">
          <Show
            when={data()}
            keyed
            fallback={
              <div class={"flex h-full items-center justify-center"}>
                <span class="loading loading-spinner loading-xl" />
              </div>
            }
          >
            {(resolvedData) => <DataTable columns={columns} data={resolvedData} />}
          </Show>
          <button
            class="btn btn-primary mx-auto mt-4"
            onClick={() => setShowCreateForm(!showCreateForm())}
          >
            Create New Player
          </button>
        </div>
      </Show>
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
    </>
  );
}

export default Players;

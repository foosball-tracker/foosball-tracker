import { ColumnDef } from "@tanstack/solid-table";
import { createResource, Show } from "solid-js";
import { supabase } from "~/service/supabaseService.ts";
import { DataTable } from "~/components/shared/table/DataTable.tsx";

// Define the Person type
interface Player {
  name: string;
}

// Define columns, including custom cells for a checkbox and an action button.
const columns: ColumnDef<Player>[] = [
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
  const [data] = createResource(getPlayers);

  return (
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
    </div>
  );
}

export default Players;

import { supabase } from "~/service/supabaseService.ts";
import { createResource, Show } from "solid-js";
import { ColumnDef } from "@tanstack/solid-table";
import { Tables } from "~/types/database.ts";
import { DataTable } from "~/components/ui/DataTable.tsx";

const getTeams = async () => {
  const { data, error } = await supabase.from("teams").select();
  if (error) {
    console.error("error fetching teams", error);
  }
  return data ?? [];
};

const columns: ColumnDef<Tables<"teams">>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
];

export default function Teams() {
  const [data] = createResource(getTeams);

  return (
    <>
      <div class={"p-2"}>
        <div class={"text-lg"}>Teams</div>
        <div class="mx-auto w-full">
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
      </div>
    </>
  );
}

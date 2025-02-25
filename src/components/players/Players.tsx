import {
  ColumnDef,
  ColumnFiltersState,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
} from "@tanstack/solid-table";
import { createResource, createSignal, For, Show } from "solid-js";
import { supabase } from "../../service/supabaseService.ts";

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

  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = createSignal("");

  const table = createSolidTable({
    get data() {
      return data() ?? [];
    },
    columns,
    state: {
      get columnFilters() {
        return columnFilters();
      },
      get globalFilter() {
        return globalFilter();
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  return (
    <div class="h-full p-2">
      <Show
        when={!data.loading}
        fallback={
          <div class={"flex h-full items-center justify-center"}>
            <span class="loading loading-spinner loading-xl" />
          </div>
        }
      >
        <input
          class="font-lg border-block mb-2 border p-2 shadow"
          value={globalFilter() ?? ""}
          onInput={(e) => setGlobalFilter(e.currentTarget.value)}
          placeholder="Search all columns..."
        />
        <div class="rounded-box border-base-content/5 bg-base-300 overflow-x-auto border">
          <table class="table w-full">
            <thead>
              <For each={table.getHeaderGroups()}>
                {(headerGroup) => (
                  <tr>
                    <For each={headerGroup.headers}>
                      {(header) => (
                        <th colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </thead>
            <tbody>
              <For each={table.getRowModel().rows}>
                {(row) => (
                  <tr>
                    <For each={row.getVisibleCells()}>
                      {(cell) => (
                        <td>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
        <div class="mt-2">
          <div>{table.getRowModel().rows.length} Rows</div>
        </div>
      </Show>
    </div>
  );
}

export default Players;

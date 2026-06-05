import type { JSX } from "solid-js";
import { For, Show } from "solid-js";
import { ColumnDef, createSolidTable, flexRender, getCoreRowModel } from "@tanstack/solid-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "~/components/shared/table/Table.tsx";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: JSX.Element;
  tableClass?: string;
}

interface ColumnMeta {
  headerClass?: string;
  cellClass?: string;
}

export function DataTable<TData, TValue>(props: Readonly<DataTableProps<TData, TValue>>) {
  const table = createSolidTable({
    get data() {
      return props.data;
    },
    get columns() {
      return props.columns;
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table class={props.tableClass}>
      <TableHeader>
        <For each={table.getHeaderGroups()}>
          {(headerGroup) => (
            <TableRow>
              <For each={headerGroup.headers}>
                {(header) => {
                  const meta = (header.column.columnDef.meta ?? {}) as ColumnMeta;

                  return (
                    <TableCell isHeader class={meta.headerClass} colSpan={header.colSpan}>
                      <Show when={!header.isPlaceholder}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Show>
                    </TableCell>
                  );
                }}
              </For>
            </TableRow>
          )}
        </For>
      </TableHeader>
      <TableBody>
        <Show
          when={table.getRowModel().rows?.length}
          fallback={
            <TableRow>
              <TableCell colSpan={props.columns.length} class="px-6 py-10">
                <div class="flex flex-col items-center gap-2 text-center">
                  <p class="text-sm font-semibold">{props.emptyTitle ?? "No rows yet"}</p>
                  <p class="text-base-content/70 max-w-md text-sm">
                    {props.emptyDescription ?? "Add your first item to populate this table."}
                  </p>
                  <Show when={props.emptyAction}>{props.emptyAction}</Show>
                </div>
              </TableCell>
            </TableRow>
          }
        >
          <For each={table.getRowModel().rows}>
            {(row) => (
              <TableRow data-state={row.getIsSelected() && "selected"}>
                <For each={row.getVisibleCells()}>
                  {(cell) => {
                    const meta = (cell.column.columnDef.meta ?? {}) as ColumnMeta;

                    return (
                      <TableCell class={meta.cellClass}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  }}
                </For>
              </TableRow>
            )}
          </For>
        </Show>
      </TableBody>
    </Table>
  );
}

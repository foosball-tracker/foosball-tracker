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
import { cn } from "~/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: JSX.Element;
  summaryItems?: DataTableSummaryItem[];
  showSummary?: boolean;
  shellClass?: string;
  scrollAreaClass?: string;
  stickyHeader?: boolean;
  tableClass?: string;
}

interface ColumnMeta {
  headerClass?: string;
  cellClass?: string;
}

interface DataTableSummaryItem {
  label: string;
  value: JSX.Element | string | number;
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

  const summaryItems = () => props.summaryItems ?? [];
  const showSummary = () => props.showSummary ?? summaryItems().length > 0;

  return (
    <div
      class={cn("rounded-box border-base-300 bg-base-100 overflow-hidden border", props.shellClass)}
    >
      <div class={cn("w-full overflow-x-auto", props.scrollAreaClass)}>
        <Table class={props.tableClass}>
          <TableHeader
            class={cn(
              props.stickyHeader &&
                "[&_th]:bg-base-200/95 supports-[backdrop-filter]:[&_th]:bg-base-200/80 [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:backdrop-blur"
            )}
          >
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
      </div>

      <Show when={showSummary()}>
        <div class="border-base-300 bg-base-200/40 flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span class="text-base-content/60 text-[0.7rem] font-semibold tracking-[0.16em] uppercase">
            Totals
          </span>
          <div class="flex flex-wrap items-center gap-x-5 gap-y-1">
            <For each={summaryItems()}>
              {(item) => (
                <div class="flex items-baseline gap-2 text-sm">
                  <span class="text-base-content/65">{item.label}</span>
                  <span class="font-semibold tabular-nums">{item.value}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}

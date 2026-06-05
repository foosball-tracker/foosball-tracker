import { ComponentProps, JSX, ParentComponent, Show, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

export const Table: ParentComponent<ComponentProps<"table">> = (rawProps) => {
  const [local, others] = splitProps(rawProps, ["class", "children"]);
  return (
    <table class={cn("table w-full min-w-full sm:min-w-[40rem]", local.class)} {...others}>
      {local.children}
    </table>
  );
};

export const TableHeader: ParentComponent<JSX.HTMLAttributes<HTMLTableSectionElement>> = (
  rawProps
) => {
  const [local, others] = splitProps(rawProps, ["class", "children"]);
  return (
    <thead
      class={cn(
        "bg-base-200/70 text-base-content/70 [&_th]:border-base-300 [&_th]:border-b",
        local.class
      )}
      {...others}
    >
      {local.children}
    </thead>
  );
};

export const TableBody: ParentComponent<JSX.HTMLAttributes<HTMLTableSectionElement>> = (
  rawProps
) => {
  const [local, others] = splitProps(rawProps, ["class", "children"]);
  return (
    <tbody class={cn("[&_tr:last-child]:border-b-0", local.class)} {...others}>
      {local.children}
    </tbody>
  );
};

export const TableRow: ParentComponent<JSX.HTMLAttributes<HTMLTableRowElement>> = (rawProps) => {
  const [local, others] = splitProps(rawProps, ["class", "children"]);
  return (
    <tr
      class={cn("border-base-300 hover:bg-base-200/60 border-b transition-colors", local.class)}
      {...others}
    >
      {local.children}
    </tr>
  );
};

interface TableCellProps extends Omit<JSX.TdHTMLAttributes<HTMLTableCellElement>, "height"> {
  isHeader?: boolean;
  height?: string;
}

export const TableCell: ParentComponent<TableCellProps> = (rawProps) => {
  const [local, others] = splitProps(rawProps, ["class", "children", "isHeader"]);

  return (
    <Show
      when={local.isHeader}
      fallback={
        <td class={cn("px-4 py-4 align-top text-sm sm:px-5", local.class)} {...others}>
          {local.children}
        </td>
      }
    >
      <th
        class={cn(
          "px-4 py-3 text-left text-[0.7rem] font-semibold tracking-[0.16em] uppercase sm:px-5",
          local.class
        )}
        {...others}
      >
        {local.children}
      </th>
    </Show>
  );
};

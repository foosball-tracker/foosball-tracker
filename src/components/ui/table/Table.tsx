import { ComponentProps, JSX, ParentComponent, Show, splitProps } from "solid-js";
import { cn } from "~/lib/utils"; // or your own path

/**
 * Table Wrapper
 * Renders a <table> wrapped in a scrollable container with DaisyUI classes.
 */
export const Table: ParentComponent<ComponentProps<"table">> = (rawProps) => {
  const [local, others] = splitProps(rawProps, ["class", "children"]);
  return (
    <div class="rounded-box border-base-content/5 bg-base-300 overflow-x-auto border">
      {/* Merge a DaisyUI "table" class with user overrides */}
      <table class={cn("table", local.class)} {...others}>
        {local.children}
      </table>
    </div>
  );
};

/**
 * TableHeader
 * Renders a <thead> with optional class overrides.
 */
export const TableHeader: ParentComponent<JSX.HTMLAttributes<HTMLTableSectionElement>> = (
  rawProps
) => {
  const [local, others] = splitProps(rawProps, ["class", "children"]);
  return (
    <thead class={cn("", local.class)} {...others}>
      {local.children}
    </thead>
  );
};

/**
 * TableBody
 * Renders a <tbody> with optional class overrides.
 */
export const TableBody: ParentComponent<JSX.HTMLAttributes<HTMLTableSectionElement>> = (
  rawProps
) => {
  const [local, others] = splitProps(rawProps, ["class", "children"]);
  return (
    <tbody class={cn("", local.class)} {...others}>
      {local.children}
    </tbody>
  );
};

/**
 * TableRow
 * Renders a <tr> with optional class overrides.
 */
export const TableRow: ParentComponent<JSX.HTMLAttributes<HTMLTableRowElement>> = (rawProps) => {
  const [local, others] = splitProps(rawProps, ["class", "children"]);
  return (
    <tr class={cn("", local.class)} {...others}>
      {local.children}
    </tr>
  );
};

/**
 * TableCell
 * Renders either a <th> or <td> depending on isHeader prop.
 * Pass class to override styles.
 */
interface TableCellProps extends JSX.TdHTMLAttributes<HTMLTableCellElement> {
  isHeader?: boolean;
}

export const TableCell: ParentComponent<TableCellProps> = (rawProps) => {
  const [local, others] = splitProps(rawProps, ["class", "children", "isHeader"]);

  return (
    <Show
      when={local.isHeader}
      fallback={
        <td class={cn("", local.class)} {...others}>
          {local.children}
        </td>
      }
    >
      <th class={cn("", local.class)} {...others}>
        {local.children}
      </th>
    </Show>
  );
};

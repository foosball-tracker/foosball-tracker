import { ComponentProps, JSX, ParentComponent, Show, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

/**
 * Table Wrapper
 * Renders a <table> wrapped in a scrollable container with DaisyUI classes.
 */
export const Table: ParentComponent<ComponentProps<"table">> = (rawProps) => {
  const [local, others] = splitProps(rawProps, ["class", "children"]);
  return (
    <div class="rounded-box border-base-content/10 bg-base-300 overflow-x-auto border shadow-sm">
      {/* DaisyUI "table" plus "table-compact" for a clean modern look. */}
      <table class={cn("table-compact table w-full", local.class)} {...others}>
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
    /* Give the header a subtle background.
       "bg-base-200" is typically lighter, you can tweak to taste. */
    <thead class={cn("bg-base-200", local.class)} {...others}>
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
 * Default includes "hover" for a hover highlight.
 */
export const TableRow: ParentComponent<JSX.HTMLAttributes<HTMLTableRowElement>> = (rawProps) => {
  const [local, others] = splitProps(rawProps, ["class", "children"]);
  return (
    <tr
      class={cn(
        // "hover" from DaisyUI highlights row on hover
        "hover:bg-base-200 transition-colors",
        local.class
      )}
      {...others}
    >
      {local.children}
    </tr>
  );
};

/**
 * TableCell
 * Renders either a <th> or <td> depending on `isHeader` prop.
 */
interface TableCellProps extends JSX.TdHTMLAttributes<HTMLTableCellElement> {
  isHeader?: boolean;
}

export const TableCell: ParentComponent<TableCellProps> = (rawProps) => {
  const [local, others] = splitProps(rawProps, ["class", "children", "isHeader"]);

  // Use <Show> to ensure Solid sees the condition in a reactive context
  return (
    <Show
      when={local.isHeader}
      fallback={
        <td class={cn("px-4 py-2", local.class)} {...others}>
          {local.children}
        </td>
      }
    >
      {/* Typically table headers might be bolder or uppercased */}
      <th class={cn("px-4 py-2 font-semibold", local.class)} {...others}>
        {local.children}
      </th>
    </Show>
  );
};

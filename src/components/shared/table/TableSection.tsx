import type { JSX, ParentComponent } from "solid-js";
import { Show, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

interface TableSectionProps extends JSX.HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description: string;
  stats?: JSX.Element;
  actions?: JSX.Element;
}

export const TableSection: ParentComponent<TableSectionProps> = (rawProps) => {
  const [local, others] = splitProps(rawProps, [
    "class",
    "children",
    "eyebrow",
    "title",
    "description",
    "stats",
    "actions",
  ]);

  return (
    <section
      class={cn("card card-border border-base-300 bg-base-100 shadow-sm", local.class)}
      {...others}
    >
      <div class="card-body gap-5 p-4 sm:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-2">
            <Show when={local.eyebrow}>
              <p class="text-base-content/60 text-xs font-semibold tracking-[0.24em] uppercase">
                {local.eyebrow}
              </p>
            </Show>
            <div class="space-y-1">
              <h1 class="card-title text-2xl">{local.title}</h1>
              <p class="text-base-content/70 max-w-2xl text-sm">{local.description}</p>
            </div>
          </div>

          <div class="flex flex-col items-stretch gap-3 sm:items-end">
            <Show when={local.stats}>
              <div class="flex flex-wrap justify-start gap-2 sm:justify-end">{local.stats}</div>
            </Show>
            <Show when={local.actions}>{local.actions}</Show>
          </div>
        </div>

        {local.children}
      </div>
    </section>
  );
};

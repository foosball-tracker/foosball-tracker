import type { JSX, ParentComponent } from "solid-js";
import { Show, splitProps } from "solid-js";
import { cn } from "~/lib/utils";

interface TableSectionProps extends JSX.HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
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
      <div class="card-body gap-5 p-4 sm:gap-6 sm:p-6">
        <div class="flex flex-col gap-4">
          <div class="space-y-2">
            <Show when={local.eyebrow}>
              <p class="text-base-content/60 text-xs font-semibold tracking-[0.24em] uppercase">
                {local.eyebrow}
              </p>
            </Show>
            <div class="space-y-1">
              <h1 class="card-title text-2xl">{local.title}</h1>
              <Show when={local.description}>
                <p class="text-base-content/70 max-w-2xl text-sm">{local.description}</p>
              </Show>
            </div>
          </div>

          <Show when={local.stats || local.actions}>
            <div class="rounded-box border-base-300 bg-base-200/40 border p-2 sm:p-3">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Show when={local.stats}>
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-2 sm:px-1">
                    {local.stats}
                  </div>
                </Show>
                <Show when={local.actions}>
                  <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    {local.actions}
                  </div>
                </Show>
              </div>
            </div>
          </Show>
        </div>

        {local.children}
      </div>
    </section>
  );
};

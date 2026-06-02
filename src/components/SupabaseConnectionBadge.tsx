import { Show, createMemo } from "solid-js";
import { hasSupabaseConfig, getSupabaseConnectionInfo } from "~/service/supabaseService.ts";

export function SupabaseConnectionBadge() {
  const connection = createMemo(() => getSupabaseConnectionInfo());

  return (
    <div class="flex min-w-0 items-center">
      <Show
        when={hasSupabaseConfig()}
        fallback={<span class="badge badge-outline badge-sm">Off</span>}
      >
        <span
          class="badge badge-outline badge-sm"
          title={`${connection().label} · ${connection().host} · VITE_CONTEXT=${connection().context}`}
        >
          {connection().label}
        </span>
      </Show>
    </div>
  );
}

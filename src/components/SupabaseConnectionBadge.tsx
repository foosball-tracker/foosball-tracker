import { Show, createMemo } from "solid-js";
import { hasSupabaseConfig, getSupabaseConnectionInfo } from "~/service/supabaseService.ts";

export function SupabaseConnectionBadge() {
  const connection = createMemo(() => getSupabaseConnectionInfo());

  return (
    <div class="flex min-w-0 items-center gap-2">
      <span class="badge badge-ghost badge-sm hidden sm:inline-flex">Supabase</span>
      <Show
        when={hasSupabaseConfig()}
        fallback={<span class="badge badge-outline badge-sm">Supabase off</span>}
      >
        <span
          class="badge badge-ghost badge-sm hidden font-mono text-[0.7rem] lg:inline-flex"
          title={`VITE_CONTEXT=${connection().context}`}
        >
          {connection().context}
        </span>
        <span class="badge badge-outline badge-sm capitalize">{connection().mode}</span>
        <span
          class="badge badge-ghost badge-sm max-w-32 truncate font-mono text-[0.7rem] sm:max-w-44"
          title={connection().url}
        >
          {connection().host}
        </span>
      </Show>
    </div>
  );
}

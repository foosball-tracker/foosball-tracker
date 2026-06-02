import { createMemo, createSignal, Show } from "solid-js";
import { getSupabaseSchemaIssue, hasSupabaseConfig } from "~/service/supabaseService";

export function SupabaseBanner() {
  const [configDismissed, setConfigDismissed] = createSignal(hasSupabaseConfig());
  const schemaIssue = createMemo(() => getSupabaseSchemaIssue());

  return (
    <>
      <Show when={schemaIssue()}>
        {(issue) => (
          <div class="alert alert-error rounded-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span>
              Connected Supabase backend is missing required schema for this branch. Match loading
              and score controls are locked until the missing migrations are applied.{" "}
              <span class="font-mono text-xs opacity-80">
                {issue().code}: {issue().context}
              </span>
            </span>
          </div>
        )}
      </Show>

      <Show when={!hasSupabaseConfig() && !schemaIssue() && !configDismissed()}>
        <div class="alert alert-warning rounded-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span>
            Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your{" "}
            <code class="badge badge-sm">.env.local</code> file to enable online features.
          </span>
          <button class="btn btn-sm btn-ghost" onClick={() => setConfigDismissed(true)}>
            Dismiss
          </button>
        </div>
      </Show>
    </>
  );
}

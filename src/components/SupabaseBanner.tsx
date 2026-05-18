import { createSignal, Show } from "solid-js";
import { hasSupabaseConfig } from "~/service/supabaseService";

export function SupabaseBanner() {
  const [dismissed, setDismissed] = createSignal(hasSupabaseConfig());

  return (
    <Show when={!dismissed()}>
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
          <code class="badge badge-sm">.env</code> file to enable online features.
        </span>
        <button class="btn btn-sm btn-ghost" onClick={() => setDismissed(true)}>
          Dismiss
        </button>
      </div>
    </Show>
  );
}

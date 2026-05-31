import { Show } from "solid-js";
import { AuthDialog } from "~/components/auth/AuthDialog.tsx";
import { useAuthSession } from "~/hooks/useAuthSession.ts";
import { hasSupabaseConfig } from "~/service/supabaseService.ts";

export function Login() {
  const { session, signOut } = useAuthSession();

  return (
    <Show
      when={!hasSupabaseConfig() || session() === null}
      fallback={
        <div class="flex min-w-0 items-center gap-2">
          <p class="hidden max-w-40 truncate text-sm sm:block">{session()?.user.email}</p>
          <button class="btn btn-ghost btn-sm sm:btn-md px-3" onClick={signOut}>
            Logout
          </button>
        </div>
      }
    >
      <Show
        when={hasSupabaseConfig()}
        fallback={<span class="text-base-content/60 text-sm">Sign in unavailable</span>}
      >
        <AuthDialog />
      </Show>
    </Show>
  );
}

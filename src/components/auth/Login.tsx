import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { Session } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "~/service/supabaseService.ts";
import { Auth } from "@supabase/auth-ui-solid";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { getRedirectUrl } from "~/components/auth/authHelper.ts";

export function Login() {
  const [session, setSession] = createSignal<Session | null>(null);
  const [isDarkAuthTheme, setIsDarkAuthTheme] = createSignal(false);

  onMount(() => {
    const html = document.documentElement;
    const updateAuthTheme = () => {
      setIsDarkAuthTheme(html.getAttribute("data-theme") === "dim");
    };
    updateAuthTheme();

    const themeObserver = new MutationObserver(updateAuthTheme);
    themeObserver.observe(html, { attributes: true, attributeFilter: ["data-theme"] });

    onCleanup(() => {
      themeObserver.disconnect();
      if (subscriptionCleanup) subscriptionCleanup();
    });

    if (!hasSupabaseConfig()) return;

    let subscriptionCleanup: () => void;

    (async () => {
      const {
        data: { session: currentSession },
      } = await supabase!.auth.getSession();
      setSession(currentSession);

      const {
        data: { subscription },
      } = supabase!.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      subscriptionCleanup = () => subscription.unsubscribe();
    })();
  });

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
  }

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
        <button
          class="btn btn-outline btn-sm sm:btn-md px-3"
          onClick={() => {
            const modal = document.getElementById("login-modal");
            if (modal instanceof HTMLDialogElement) {
              modal.showModal();
            }
          }}
        >
          Sign in
        </button>
        <dialog id="login-modal" class="modal">
          <div class="modal-box">
            <h3 class="text-lg font-bold">Sign in</h3>
            <Auth
              supabaseClient={supabase!}
              appearance={{
                theme: ThemeSupa,
              }}
              providers={["google"]}
              socialLayout={"horizontal"}
              theme="default"
              dark={isDarkAuthTheme()}
              redirectTo={getRedirectUrl()}
            />
            <div class="modal-action">
              <form method="dialog">
                <button class="btn btn-ghost btn-sm sm:btn-md">Close</button>
              </form>
            </div>
          </div>
        </dialog>
      </Show>
    </Show>
  );
}

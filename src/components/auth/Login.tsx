import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { Session } from "@supabase/supabase-js";
import { supabase } from "~/service/supabaseService.ts";
import { Auth } from "@supabase/auth-ui-solid";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export function Login() {
  const [session, setSession] = createSignal<Session | null>(null);

  // On component mount, get the current session and subscribe to auth state changes.
  onMount(() => {
    let subscriptionCleanup: () => void;

    // Register cleanup immediately in the reactive context.
    onCleanup(() => {
      if (subscriptionCleanup) subscriptionCleanup();
    });

    (async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      // Assign the cleanup function for later use.
      subscriptionCleanup = () => subscription.unsubscribe();
    })();
  });

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
  }

  return (
    <Show
      when={session() === null}
      fallback={
        <div class="flex items-center gap-2">
          <p>{session()?.user.email}</p>
          <button class="btn btn-secondary" onClick={signOut}>
            Logout
          </button>
        </div>
      }
    >
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button
        class="btn"
        onClick={() => {
          const modal = document.getElementById("login-modal");
          if (modal instanceof HTMLDialogElement) {
            modal.showModal();
          }
        }}
      >
        open modal
      </button>
      <dialog id="login-modal" class="modal">
        <div class="modal-box">
          <h3 class="text-lg font-bold">Sign in</h3>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              className: {
                message: "bg-blue-500",
              },
            }}
            providers={["google"]}
            socialLayout={"horizontal"}
            theme={"dark"}
          />
          <div class="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button class="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
      {/*<button*/}
      {/*  class={"btn btn-primary"}*/}
      {/*  onClick={() => {*/}
      {/*    supabase.auth*/}
      {/*      .signInWithOAuth({*/}
      {/*        provider: "google",*/}
      {/*      })*/}
      {/*      .then((response) => {*/}
      {/*        console.log("Sign in with Google", response);*/}
      {/*      });*/}
      {/*  }}*/}
      {/*>*/}
      {/*  Log in with Google*/}
      {/*</button>*/}
    </Show>
  );
}

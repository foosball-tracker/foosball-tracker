import { createSignal, lazy, onCleanup, onMount, Show, Suspense } from "solid-js";
import { supabase } from "./service/supabaseService.ts";
import { Session } from "@supabase/supabase-js";

const ProtectedApp = lazy(() => import("./components/ProtectedApp.tsx"));

export default function App() {
  const [session, setSession] = createSignal<Session>(null);

  console.log("app comp");
  // On component mount, get the current session and subscribe to auth state changes.
  onMount(async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    setSession(currentSession);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup the subscription when the component unmounts.
    onCleanup(() => {
      subscription.unsubscribe();
    });
  });

  return (
    <>
      <Show
        when={!session()}
        fallback={
          <Suspense
            fallback={<div class="flex min-h-screen items-center justify-center">Loading...</div>}
          >
            <ProtectedApp />
          </Suspense>
        }
      >
        <div>
          Test
          <div
            id="g_id_onload"
            data-client_id="254051931536-qesqcvcm2brdrah5mj8k51tcm2fktqtk.apps.googleusercontent.com"
            data-context="signin"
            data-ux_mode="redirect"
            data-callback="handleSignInWithGoogle"
            data-nonce=""
            data-auto_select="true"
            data-itp_support="true"
            data-use_fedcm_for_prompt="true"
          />
          <div
            class="g_id_signin"
            data-type="standard"
            data-shape="rectangular"
            data-theme="filled_black"
            data-text="signin_with"
            data-size="large"
            data-locale="en-GB"
            data-logo_alignment="left"
          />
        </div>
        {/*<Auth*/}
        {/*  supabaseClient={supabase}*/}
        {/*  appearance={{ theme: ThemeSupa }}*/}
        {/*  providers={["apple", "google", "github"]}*/}
        {/*  foo*/}
        {/*/>*/}
      </Show>
    </>
  );
}

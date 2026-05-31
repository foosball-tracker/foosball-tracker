import { createSignal, onCleanup, onMount } from "solid-js";
import type { Session } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "~/service/supabaseService";

export function useAuthSession() {
  const [session, setSession] = createSignal<Session | null>(null);
  const [loading, setLoading] = createSignal(hasSupabaseConfig());

  onMount(() => {
    let disposed = false;
    let unsubscribe: (() => void) | undefined;

    if (!hasSupabaseConfig() || !supabase) {
      setLoading(false);
      return;
    }

    void (async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (disposed) return;

      setSession(currentSession);
      setLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setLoading(false);
      });

      unsubscribe = () => subscription.unsubscribe();
    })();

    onCleanup(() => {
      disposed = true;
      unsubscribe?.();
    });
  });

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
  };

  return {
    session,
    loading,
    signOut,
  };
}

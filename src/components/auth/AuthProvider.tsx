import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  createSignal,
  onCleanup,
  onMount,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import { hasSupabaseConfig, supabase } from "~/service/supabaseService";

interface AuthContextValue {
  loading: Accessor<boolean>;
  session: Accessor<Session | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>();

export function AuthProvider(props: Readonly<{ children: JSX.Element }>) {
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

  return (
    <AuthContext.Provider value={{ loading, session, signOut }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

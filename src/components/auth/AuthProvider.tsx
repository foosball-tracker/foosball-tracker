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
import { clearAuthRedirectState, isRecoveryRedirect } from "~/components/auth/authHelper.ts";
import { hasSupabaseConfig, supabase } from "~/service/supabaseService";

interface AuthContextValue {
  loading: Accessor<boolean>;
  recoveryMode: Accessor<boolean>;
  session: Accessor<Session | null>;
  clearRecoveryMode: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>();

export function AuthProvider(props: Readonly<{ children: JSX.Element }>) {
  const [session, setSession] = createSignal<Session | null>(null);
  const [loading, setLoading] = createSignal(hasSupabaseConfig());
  const [recoveryMode, setRecoveryMode] = createSignal(false);

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
      setRecoveryMode(isRecoveryRedirect());
      setLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, nextSession) => {
        setSession(nextSession);
        setLoading(false);

        if (event === "PASSWORD_RECOVERY") {
          setRecoveryMode(true);
          return;
        }

        if (event === "INITIAL_SESSION") {
          setRecoveryMode(isRecoveryRedirect());
          return;
        }

        if (event === "SIGNED_OUT") {
          setRecoveryMode(false);
        }
      });

      unsubscribe = () => subscription.unsubscribe();
    })();

    onCleanup(() => {
      disposed = true;
      unsubscribe?.();
    });
  });

  const clearRecoveryMode = () => {
    setRecoveryMode(false);
    clearAuthRedirectState();
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ loading, recoveryMode, session, clearRecoveryMode, signOut }}>
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

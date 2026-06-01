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

const SESSION_BOOT_TIMEOUT_MS = 8_000;

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

    if (!hasSupabaseConfig() || !supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (disposed) return;

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

    const sessionTimeout = globalThis.setTimeout(() => {
      if (disposed) return;

      console.warn("Supabase session bootstrap timed out; continuing without a session.");
      setRecoveryMode(isRecoveryRedirect());
      setLoading(false);
    }, SESSION_BOOT_TIMEOUT_MS);

    void (async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (disposed) return;

        globalThis.clearTimeout(sessionTimeout);
        setSession(currentSession);
        setRecoveryMode(isRecoveryRedirect());
        setLoading(false);
      } catch (error) {
        if (disposed) return;

        globalThis.clearTimeout(sessionTimeout);
        console.error("Failed to bootstrap Supabase session:", error);
        setRecoveryMode(isRecoveryRedirect());
        setLoading(false);
      }
    })();

    onCleanup(() => {
      disposed = true;
      globalThis.clearTimeout(sessionTimeout);
      subscription.unsubscribe();
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

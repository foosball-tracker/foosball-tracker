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

const SESSION_BOOTSTRAP_TIMEOUT_MS = 8_000;

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
    let bootstrapFallbackId: number | undefined;

    if (!hasSupabaseConfig() || !supabase) {
      setLoading(false);
      return;
    }

    bootstrapFallbackId = window.setTimeout(() => {
      if (disposed) return;

      setRecoveryMode(isRecoveryRedirect());
      setLoading(false);
    }, SESSION_BOOTSTRAP_TIMEOUT_MS);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (disposed) return;

      if (bootstrapFallbackId !== undefined) {
        window.clearTimeout(bootstrapFallbackId);
        bootstrapFallbackId = undefined;
      }

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

    void (async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (disposed) return;

        if (bootstrapFallbackId !== undefined) {
          window.clearTimeout(bootstrapFallbackId);
          bootstrapFallbackId = undefined;
        }

        setSession(currentSession);
        setRecoveryMode(isRecoveryRedirect());
        setLoading(false);
      } catch (error) {
        if (disposed) return;

        if (bootstrapFallbackId !== undefined) {
          window.clearTimeout(bootstrapFallbackId);
          bootstrapFallbackId = undefined;
        }

        console.error("Failed to bootstrap Supabase session:", error);
        setRecoveryMode(isRecoveryRedirect());
        setLoading(false);
      }
    })();

    onCleanup(() => {
      disposed = true;
      if (bootstrapFallbackId !== undefined) {
        window.clearTimeout(bootstrapFallbackId);
      }
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

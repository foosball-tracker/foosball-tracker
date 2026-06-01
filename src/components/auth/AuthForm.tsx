import { A, useNavigate } from "@solidjs/router";
import { createEffect, createMemo, createSignal, Match, onCleanup, Show, Switch } from "solid-js";
import { getAuthRouteUrl, getRedirectUrl } from "~/components/auth/authHelper.ts";
import { useAuthSession } from "~/hooks/useAuthSession.ts";
import { supabase } from "~/service/supabaseService.ts";

type AuthMode = "signin" | "signup" | "forgot" | "reset";
type AuthSurface = "card" | "plain";

interface AuthFormProps {
  idPrefix?: string;
  showBackLink?: boolean;
  surface?: AuthSurface;
}

const modeCopy: Record<
  AuthMode,
  {
    title: string;
    description: string;
    submitLabel: string;
  }
> = {
  signin: {
    title: "Sign in",
    description: "Use your email or Google account to manage teams, players, and matches.",
    submitLabel: "Sign in",
  },
  signup: {
    title: "Create account",
    description: "Set up an account so you can keep scores, players, and teams in sync.",
    submitLabel: "Create account",
  },
  forgot: {
    title: "Reset password",
    description: "Enter your email address and we will send you a link to choose a new password.",
    submitLabel: "Send reset link",
  },
  reset: {
    title: "Choose a new password",
    description: "Set a new password for your account, then continue back to the app.",
    submitLabel: "Save new password",
  },
};

function validateEmail(email: string) {
  const trimmedEmail = email.trim();
  const atIndex = trimmedEmail.indexOf("@");
  const dotIndex = trimmedEmail.lastIndexOf(".");

  return (
    atIndex > 0 &&
    dotIndex > atIndex + 1 &&
    dotIndex < trimmedEmail.length - 1 &&
    !trimmedEmail.includes(" ")
  );
}

function mapAuthError(error: unknown, mode: AuthMode) {
  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }

  const message = error.message.toLowerCase();

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid email or password")
  ) {
    return "Email or password is incorrect.";
  }

  if (message.includes("email not confirmed")) {
    return "Check your email and confirm your account before signing in.";
  }

  if (message.includes("user already registered") || message.includes("already been registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (message.includes("password should be at least")) {
    return "Use a password with at least 6 characters.";
  }

  if (message.includes("same password")) {
    return "Choose a new password that is different from your current one.";
  }

  if (
    message.includes("expired") ||
    message.includes("invalid refresh token") ||
    message.includes("auth session missing")
  ) {
    return mode === "reset"
      ? "This recovery link has expired. Request a new password reset email."
      : "This sign-in link is no longer valid. Please try again.";
  }

  if (message.includes("network")) {
    return "The app could not reach the sign-in service. Please try again.";
  }

  if (mode === "forgot") {
    return "We could not send the reset email right now. Please try again.";
  }

  if (mode === "signup") {
    return "We could not create your account right now. Please try again.";
  }

  if (mode === "reset") {
    return "We could not save your new password right now. Please try again.";
  }

  return "We could not sign you in right now. Please try again.";
}

export function AuthForm(props: Readonly<AuthFormProps>) {
  const navigate = useNavigate();
  const { clearRecoveryMode, recoveryMode } = useAuthSession();
  const fieldId = (name: string) => (props.idPrefix ? `${props.idPrefix}-${name}` : name);
  const [mode, setMode] = createSignal<AuthMode>(recoveryMode() ? "reset" : "signin");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [activeAction, setActiveAction] = createSignal<"email" | "google" | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
  const [successMessage, setSuccessMessage] = createSignal<string | null>(null);
  let redirectTimer: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
    }
  });

  createEffect(() => {
    if (recoveryMode()) {
      setMode("reset");
      setErrorMessage(null);
      setSuccessMessage(null);
      return;
    }

    if (mode() === "reset") {
      setMode("signin");
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  });

  const currentCopy = createMemo(() => modeCopy[mode()]);
  const isPlainSurface = createMemo(() => props.surface === "plain");
  const showGoogleButton = createMemo(() => mode() === "signin" || mode() === "signup");
  const showPasswordField = createMemo(
    () => mode() === "signin" || mode() === "signup" || mode() === "reset"
  );
  const showConfirmPasswordField = createMemo(() => mode() === "signup" || mode() === "reset");

  const switchMode = (nextMode: AuthMode) => {
    if (mode() === nextMode) return;
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
    setSuccessMessage(null);

    if (nextMode !== "reset") {
      clearRecoveryMode();
    }
  };

  const validateForm = () => {
    const trimmedEmail = email().trim();

    if (mode() !== "reset") {
      if (!trimmedEmail) {
        return "Enter your email address.";
      }

      if (!validateEmail(trimmedEmail)) {
        return "Enter a valid email address.";
      }
    }

    if (showPasswordField() && !password()) {
      return mode() === "reset" ? "Enter a new password." : "Enter your password.";
    }

    if ((mode() === "signup" || mode() === "reset") && password().length < 6) {
      return "Use a password with at least 6 characters.";
    }

    if (showConfirmPasswordField() && password() !== confirmPassword()) {
      return "Passwords do not match.";
    }

    return null;
  };

  const handleSignIn = async () => {
    const { error } = await supabase!.auth.signInWithPassword({
      email: email().trim(),
      password: password(),
    });
    if (error) throw error;
  };

  const handleSignUp = async () => {
    const { data, error } = await supabase!.auth.signUp({
      email: email().trim(),
      password: password(),
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });
    if (error) throw error;

    setPassword("");
    setConfirmPassword("");

    if (!data.session) {
      setSuccessMessage("Check your email to confirm your account, then sign in.");
      setMode("signin");
    }
  };

  const handleForgotPassword = async () => {
    const { error } = await supabase!.auth.resetPasswordForEmail(email().trim(), {
      redirectTo: getAuthRouteUrl("/login"),
    });
    if (error) throw error;

    setSuccessMessage("If that email is registered, a reset link is on its way.");
  };

  const handlePasswordReset = async () => {
    const { error } = await supabase!.auth.updateUser({ password: password() });
    if (error) throw error;

    setPassword("");
    setConfirmPassword("");
    setSuccessMessage("Password updated. Redirecting you back to the app.");
    redirectTimer = setTimeout(() => {
      clearRecoveryMode();
      navigate("/", { replace: true });
    }, 900);
  };

  const runEmailAction = async () => {
    switch (mode()) {
      case "signin":
        await handleSignIn();
        return;
      case "signup":
        await handleSignUp();
        return;
      case "forgot":
        await handleForgotPassword();
        return;
      case "reset":
        await handlePasswordReset();
        return;
    }
  };

  const handleEmailSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setActiveAction("email");
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }

      await runEmailAction();
    } catch (error) {
      setErrorMessage(mapAuthError(error, mode()));
    } finally {
      setIsSubmitting(false);
      setActiveAction(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setActiveAction("google");
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getRedirectUrl(),
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setErrorMessage("Google sign-in is unavailable right now. Please try again.");
      console.error(error);
      setIsSubmitting(false);
      setActiveAction(null);
    }
  };

  const content = (
    <>
      <div class="space-y-2">
        <h1 class="text-2xl font-black tracking-tight">{currentCopy().title}</h1>
        <p class="text-base-content/80 text-sm leading-6">{currentCopy().description}</p>
      </div>

      <Switch>
        <Match when={errorMessage()}>
          <div class="alert alert-error text-sm">
            <span>{errorMessage()}</span>
          </div>
        </Match>
        <Match when={successMessage()}>
          <div class="alert alert-success text-sm">
            <span>{successMessage()}</span>
          </div>
        </Match>
      </Switch>

      <Show when={showGoogleButton()}>
        <button
          type="button"
          class="btn btn-outline w-full"
          disabled={isSubmitting()}
          onClick={() => void handleGoogleSignIn()}
        >
          <Show when={activeAction() === "google"} fallback={"Continue with Google"}>
            <span class="loading loading-spinner loading-sm" aria-hidden="true" />
          </Show>
        </button>

        <div class="divider my-1 text-xs">or</div>
      </Show>

      <form
        class="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleEmailSubmit();
        }}
      >
        <Show when={mode() !== "reset"}>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold" for={fieldId("email")}>
              Email address
            </label>
            <input
              id={fieldId("email")}
              type="email"
              class="input input-bordered w-full"
              value={email()}
              onInput={(event) => setEmail(event.currentTarget.value)}
              placeholder="name@example.com"
              autocomplete="email"
              autocapitalize="none"
              spellcheck={false}
              disabled={isSubmitting()}
            />
          </div>
        </Show>

        <Show when={showPasswordField()}>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold" for={fieldId("password")}>
              {mode() === "reset" ? "New password" : "Password"}
            </label>
            <input
              id={fieldId("password")}
              type="password"
              class="input input-bordered w-full"
              value={password()}
              onInput={(event) => setPassword(event.currentTarget.value)}
              placeholder={mode() === "reset" ? "Choose a new password" : "Enter your password"}
              autocomplete={mode() === "signin" ? "current-password" : "new-password"}
              disabled={isSubmitting()}
            />
          </div>
        </Show>

        <Show when={showConfirmPasswordField()}>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold" for={fieldId("confirm-password")}>
              Confirm password
            </label>
            <input
              id={fieldId("confirm-password")}
              type="password"
              class="input input-bordered w-full"
              value={confirmPassword()}
              onInput={(event) => setConfirmPassword(event.currentTarget.value)}
              placeholder="Repeat your password"
              autocomplete="new-password"
              disabled={isSubmitting()}
            />
          </div>
        </Show>

        <div class="space-y-3 pt-2">
          <button type="submit" class="btn btn-primary w-full" disabled={isSubmitting()}>
            <Show when={activeAction() === "email"} fallback={currentCopy().submitLabel}>
              <span class="loading loading-spinner loading-sm" aria-hidden="true" />
            </Show>
          </button>

          <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
            <Show when={mode() === "signin"}>
              <>
                <button
                  type="button"
                  class="link link-hover text-base-content/80 font-medium"
                  onClick={() => switchMode("forgot")}
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  class="link link-hover text-base-content font-medium"
                  onClick={() => switchMode("signup")}
                >
                  Create account
                </button>
              </>
            </Show>

            <Show when={mode() === "signup"}>
              <button
                type="button"
                class="link link-hover text-base-content font-medium"
                onClick={() => switchMode("signin")}
              >
                Already have an account? Sign in
              </button>
            </Show>

            <Show when={mode() === "forgot"}>
              <button
                type="button"
                class="link link-hover text-base-content font-medium"
                onClick={() => switchMode("signin")}
              >
                Back to sign in
              </button>
            </Show>

            <Show when={mode() === "reset"}>
              <button
                type="button"
                class="link link-hover text-base-content font-medium"
                onClick={() => switchMode("forgot")}
              >
                Request a new reset link
              </button>
            </Show>
          </div>
        </div>
      </form>

      <Show when={props.showBackLink}>
        <div class="card-actions justify-start pt-2">
          <A class="btn btn-ghost btn-sm" href="/">
            Back to start
          </A>
        </div>
      </Show>
    </>
  );

  return (
    <Show
      when={isPlainSurface()}
      fallback={
        <div class="card border-base-300 bg-base-100 shadow-sm">
          <div class="card-body gap-5 p-6 sm:p-8">{content}</div>
        </div>
      }
    >
      <div class="flex flex-col gap-5">{content}</div>
    </Show>
  );
}

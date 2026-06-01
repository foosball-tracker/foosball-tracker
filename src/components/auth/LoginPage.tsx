import { A, useNavigate } from "@solidjs/router";
import { createEffect, Show } from "solid-js";
import { AuthForm } from "~/components/auth/AuthForm.tsx";
import Spinner from "~/components/shared/Spinner.tsx";
import { useAuthSession } from "~/hooks/useAuthSession.ts";
import { hasSupabaseConfig } from "~/service/supabaseService.ts";

export default function LoginPage() {
  const { loading, session } = useAuthSession();
  const navigate = useNavigate();

  createEffect(() => {
    if (!loading() && session()) {
      navigate("/", { replace: true });
    }
  });

  return (
    <main class="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-4 py-8 sm:px-6">
      <Show when={!loading()} fallback={<Spinner />}>
        <Show
          when={hasSupabaseConfig()}
          fallback={
            <div class="card border-base-300 bg-base-100 shadow-sm">
              <div class="card-body gap-5 p-6 sm:p-8">
                <div class="space-y-2">
                  <h1 class="text-2xl font-black tracking-tight">Sign in unavailable</h1>
                  <p class="text-base-content/80 text-sm">
                    Supabase is not configured, so authentication cannot be used right now.
                  </p>
                </div>

                <div class="alert alert-warning text-sm">
                  <span>Add the local Supabase environment variables to enable sign-in.</span>
                </div>

                <div class="card-actions justify-start">
                  <A class="btn btn-ghost btn-sm" href="/">
                    Back to start
                  </A>
                </div>
              </div>
            </div>
          }
        >
          <AuthForm idPrefix="login-page" showBackLink surface="card" />
        </Show>
      </Show>
    </main>
  );
}

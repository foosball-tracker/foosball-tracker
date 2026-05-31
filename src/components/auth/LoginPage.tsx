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
      <div class="card border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-5 p-6 sm:p-8">
          <div>
            <h1 class="text-2xl font-black tracking-tight">Sign in</h1>
            <p class="text-base-content/70 mt-2 text-sm">
              Sign in to manage teams, players, and matches.
            </p>
          </div>

          <Show when={!loading()} fallback={<Spinner />}>
            <Show
              when={hasSupabaseConfig()}
              fallback={
                <div class="alert alert-warning">
                  <span>Supabase is not configured. Sign in is unavailable.</span>
                </div>
              }
            >
              <AuthForm />
            </Show>
          </Show>

          <div class="card-actions justify-start">
            <A class="btn btn-ghost btn-sm" href="/">
              Back to start
            </A>
          </div>
        </div>
      </div>
    </main>
  );
}

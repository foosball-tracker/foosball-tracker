import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, Match, type ParentComponent, Show, Switch } from "solid-js";
import { AppHeader } from "~/components/AppHeader.tsx";
import Spinner from "~/components/shared/Spinner.tsx";
import { SupabaseBanner } from "../components/SupabaseBanner.tsx";
import { useAuthSession } from "~/hooks/useAuthSession.ts";

const PUBLIC_PATHS = new Set(["/login"]);

export const MainLayout: ParentComponent = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, recoveryMode, session } = useAuthSession();

  const isPublicRoute = () => PUBLIC_PATHS.has(location.pathname);

  createEffect(() => {
    if (loading()) return;

    if (!session() && !isPublicRoute()) {
      navigate("/login", { replace: true });
      return;
    }

    if (session() && location.pathname === "/login" && !recoveryMode()) {
      navigate("/", { replace: true });
    }
  });

  return (
    <div class="bg-base-200 text-base-content flex h-screen flex-col">
      <SupabaseBanner />
      <AppHeader />
      <div class="bg-base-200 flex-1 overflow-y-auto">
        <Switch>
          <Match when={loading()}>
            <div class="flex min-h-full items-center justify-center">
              <Spinner />
            </div>
          </Match>
          <Match when={isPublicRoute() || session()}>
            <Show when={!(session() && location.pathname === "/login" && !recoveryMode())}>
              {props.children}
            </Show>
          </Match>
          <Match when={true}>
            <div class="flex min-h-full items-center justify-center">
              <Spinner />
            </div>
          </Match>
        </Switch>
      </div>
    </div>
  );
};

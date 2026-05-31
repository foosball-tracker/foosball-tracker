import { A } from "@solidjs/router";
import type { Session } from "@supabase/supabase-js";
import { Menu, Trophy, Users } from "lucide-solid";
import { type Accessor, For, type JSX, Match, Show, Switch } from "solid-js";
import { AuthDialog } from "~/components/auth/AuthDialog.tsx";
import { ThemeSwitch } from "~/components/ThemeSwitch.tsx";
import { hasSupabaseConfig } from "~/service/supabaseService.ts";

interface HomeShellProps {
  children: JSX.Element;
  loadingSession: Accessor<boolean>;
  onSignOut: () => Promise<void>;
  session: Accessor<Session | null>;
}

const navItems = [
  { href: "/players", label: "Players", icon: Users },
  { href: "/teams", label: "Teams", icon: Trophy },
];

export function HomeShell(props: Readonly<HomeShellProps>) {
  const menuContent = (
    <ul class="menu gap-2 p-2">
      <For each={navItems}>
        {(item) => (
          <li>
            <A
              href={item.href}
              activeClass="menu-active"
              class="rounded-box flex items-center gap-3 px-3 py-3 text-sm font-medium"
            >
              <item.icon class="h-4 w-4" />
              <span>{item.label}</span>
            </A>
          </li>
        )}
      </For>
    </ul>
  );

  return (
    <div class="bg-base-200 text-base-content flex h-full min-h-0">
      <aside class="border-base-300 bg-base-100 hidden w-80 flex-col border-r px-6 py-6 lg:flex">
        <div class="space-y-8">
          <div>
            <p class="text-base-content/60 text-xs font-semibold tracking-[0.24em] uppercase">
              Foosball
            </p>
            <h1 class="mt-2 text-3xl font-black tracking-tight">Tracker</h1>
          </div>

          <div class="card border-primary/10 bg-primary text-primary-content shadow-sm">
            <div class="card-body gap-4 p-5">
              <div class="flex items-center gap-4">
                <div class="avatar placeholder">
                  <div class="bg-base-100 text-primary rounded-full">
                    <span class="text-lg font-semibold">
                      {props.session()?.user.email?.slice(0, 1).toUpperCase() ?? "G"}
                    </span>
                  </div>
                </div>
                <div class="min-w-0">
                  <p class="truncate text-lg font-bold">
                    {props.session()?.user.email?.split("@")[0] ?? "Guest mode"}
                  </p>
                  <p class="truncate text-sm opacity-80">
                    {props.session()?.user.email ?? "Track local matches or sign in for sync"}
                  </p>
                </div>
              </div>

              <Switch>
                <Match when={props.loadingSession()}>
                  <div class="skeleton h-10 w-full" />
                </Match>
                <Match when={props.session()}>
                  <button
                    class="btn btn-sm bg-base-100/15 text-primary-content border-none"
                    onClick={() => void props.onSignOut()}
                  >
                    Logout
                  </button>
                </Match>
                <Match when={hasSupabaseConfig()}>
                  <AuthDialog
                    buttonClass="btn btn-sm border-none bg-base-100 text-primary"
                    buttonLabel="Sign in"
                  />
                </Match>
                <Match when={true}>
                  <span class="text-sm opacity-80">Supabase not configured</span>
                </Match>
              </Switch>
            </div>
          </div>

          <nav class="rounded-box border-base-300 bg-base-100 border py-3 shadow-sm">
            {menuContent}
          </nav>
        </div>
      </aside>

      <div class="flex min-h-0 flex-1 flex-col">
        <header class="border-base-300 bg-base-100/90 sticky top-0 z-20 border-b px-4 py-4 backdrop-blur lg:hidden">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-base-content/60 text-[0.65rem] font-semibold tracking-[0.22em] uppercase">
                Foosball
              </p>
              <h1 class="text-lg font-black tracking-tight">Tracker</h1>
            </div>

            <div class="flex items-center gap-2">
              <ThemeSwitch />
              <details class="dropdown dropdown-end">
                <summary
                  class="btn btn-ghost btn-circle list-none"
                  aria-label="Open navigation menu"
                >
                  <Menu class="h-5 w-5" />
                </summary>
                <div class="dropdown-content rounded-box border-base-300 bg-base-100 z-30 mt-3 w-72 border p-2 shadow-xl">
                  {menuContent}
                  <div class="border-base-300 mt-2 border-t px-3 pt-3">
                    <Show
                      when={props.session()}
                      fallback={
                        <Show
                          when={hasSupabaseConfig()}
                          fallback={
                            <span class="text-base-content/60 text-sm">Sign in unavailable</span>
                          }
                        >
                          <AuthDialog
                            buttonClass="btn btn-outline btn-sm w-full"
                            buttonLabel="Sign in"
                          />
                        </Show>
                      }
                    >
                      <div class="space-y-2">
                        <p class="truncate text-sm font-medium">{props.session()?.user.email}</p>
                        <button
                          class="btn btn-ghost btn-sm w-full justify-start"
                          onClick={() => void props.onSignOut()}
                        >
                          Logout
                        </button>
                      </div>
                    </Show>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto">
          <div class="mx-auto flex min-h-full w-full max-w-[1600px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div class="hidden items-center justify-end lg:flex">
              <ThemeSwitch />
            </div>
            {props.children}
          </div>
        </main>
      </div>
    </div>
  );
}

import { A, useLocation } from "@solidjs/router";
import { Medal, Menu, UserRound, UsersRound } from "lucide-solid";
import { createSignal, For } from "solid-js";
import { Login } from "~/components/auth/Login.tsx";
import { ThemeSwitch } from "~/components/ThemeSwitch.tsx";

const navItems = [
  { href: "/players", label: "Players", icon: UserRound },
  { href: "/teams", label: "Teams", icon: UsersRound },
  { href: "/leaderboard", label: "Leaderboard", icon: Medal },
];

export function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const location = useLocation();

  const closeMenu = () => setIsMenuOpen(false);
  const isCurrentPath = (href: string) => location.pathname.startsWith(href);

  return (
    <header class="border-base-300/80 bg-base-100/95 sticky top-0 z-30 border-b shadow-sm backdrop-blur">
      <div class="navbar mx-auto min-h-16 w-full max-w-[1600px] gap-2 px-3 sm:px-6 lg:px-8">
        <div class="navbar-start min-w-0 flex-1 gap-2">
          <details class="dropdown shrink-0 lg:hidden" open={isMenuOpen()}>
            <summary
              class="btn btn-ghost btn-circle btn-sm list-none"
              aria-label="Open navigation menu"
              onClick={(event) => {
                event.preventDefault();
                setIsMenuOpen((value) => !value);
              }}
            >
              <Menu class="h-5 w-5" />
            </summary>
            <ul class="menu menu-sm dropdown-content rounded-box border-base-300 bg-base-100 z-40 mt-3 w-56 border p-2 shadow-lg">
              <For each={navItems}>
                {(item) => (
                  <li>
                    <A
                      href={item.href}
                      activeClass="menu-active"
                      class="rounded-box flex items-center gap-3"
                      onClick={closeMenu}
                    >
                      <item.icon class="h-4 w-4" />
                      <span>{item.label}</span>
                    </A>
                  </li>
                )}
              </For>
            </ul>
          </details>

          <A
            class="btn btn-ghost min-w-0 justify-start truncate px-1 text-base font-black tracking-tight sm:px-2 sm:text-xl"
            href="/"
            onClick={closeMenu}
          >
            Foosball Tracker
          </A>
        </div>

        <nav class="navbar-center hidden lg:flex" aria-label="Primary navigation">
          <ul class="menu menu-horizontal gap-1 px-1">
            <For each={navItems}>
              {(item) => (
                <li>
                  <A
                    href={item.href}
                    activeClass="menu-active"
                    class={`rounded-box flex items-center gap-2 font-medium ${
                      isCurrentPath(item.href) ? "menu-active" : ""
                    }`}
                  >
                    <item.icon class="h-4 w-4" />
                    <span>{item.label}</span>
                  </A>
                </li>
              )}
            </For>
          </ul>
        </nav>

        <div class="navbar-end ml-1 flex-none items-center gap-1 sm:ml-0 sm:gap-2">
          <ThemeSwitch />
          <Login />
        </div>
      </div>
    </header>
  );
}

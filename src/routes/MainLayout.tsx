import { A } from "@solidjs/router";
import { ThemeSwitch } from "../components/ThemeSwitch.tsx";
import { ParentComponent } from "solid-js";
import { Login } from "../components/auth/Login.tsx";
import { SupabaseBanner } from "../components/SupabaseBanner.tsx";

export const MainLayout: ParentComponent = (props) => {
  return (
    <div class="bg-base-200 text-base-content flex h-screen flex-col">
      <div class="navbar border-base-300/80 bg-base-100/95 sticky top-0 z-30 min-h-16 gap-1 border-b px-2 shadow-sm backdrop-blur sm:gap-2 sm:px-4">
        <div class="navbar-start min-w-0 flex-1 gap-1 sm:gap-2">
          {/* Mobile hamburger */}
          <details class="dropdown shrink-0 lg:hidden">
            <summary class="btn btn-ghost btn-circle btn-sm list-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </summary>
            <ul class="menu menu-sm dropdown-content bg-base-100 rounded-box border-base-300 z-[1] mt-3 w-52 border p-2 shadow-lg">
              <li>
                <A href={"/players"} activeClass={"menu-active"}>
                  Players
                </A>
              </li>
              <li>
                <A href={"/teams"} activeClass={"menu-active"}>
                  Teams
                </A>
              </li>
            </ul>
          </details>

          <A
            class="btn btn-ghost min-w-0 flex-1 justify-start truncate px-1 text-sm leading-tight font-semibold sm:flex-none sm:px-2 sm:text-xl"
            href={"/"}
          >
            Foosball Tracker
          </A>
        </div>

        {/* Desktop nav */}
        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1">
            <li>
              <A href={"/players"} activeClass={"menu-active"}>
                Players
              </A>
            </li>
            <li>
              <A href={"/teams"} activeClass={"menu-active"}>
                Teams
              </A>
            </li>
          </ul>
        </div>

        <div class="navbar-end ml-1 flex-none items-center gap-1 sm:ml-0 sm:gap-2">
          <div class="shrink-0">
            <ThemeSwitch />
          </div>
          <Login />
        </div>
      </div>
      <SupabaseBanner />
      <div class="bg-base-200 flex-1 overflow-y-auto">{props.children}</div>
    </div>
  );
};

import { A } from "@solidjs/router";
import { ThemeSwitch } from "../components/ThemeSwitch.tsx";
import { ParentComponent } from "solid-js";
import { Login } from "../components/auth/Login.tsx";
import { SupabaseBanner } from "../components/SupabaseBanner.tsx";

export const MainLayout: ParentComponent = (props) => {
  return (
    <div class={"flex h-screen flex-col"}>
      <div class="navbar bg-base-100 h-20 shadow-sm">
        <div class="navbar-start">
          {/* Mobile hamburger */}
          <div class="dropdown lg:hidden">
            <button type="button" class="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
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
            </button>
            <ul class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
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

          <A class="btn btn-ghost text-xl" href={"/"}>
            Foosball Tracker
          </A>
          <div class="flex gap-2">
            <ThemeSwitch />
          </div>
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

        <div class="navbar-end">
          <Login />
        </div>
      </div>
      <SupabaseBanner />
      <div class={"flex-1 overflow-y-auto"}>{props.children}</div>
    </div>
  );
};

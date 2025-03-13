import { A } from "@solidjs/router";
import { MqttStatus } from "../components/MqttStatus.tsx";
import { ThemeSwitch } from "../components/ThemeSwitch.tsx";
import { ParentComponent } from "solid-js";
import { Login } from "../components/auth/Login.tsx";

export const MainLayout: ParentComponent = (props) => {
  return (
    <div class={"flex h-screen flex-col"}>
      <div class="navbar bg-base-100 h-20 shadow-sm">
        <div class="navbar-start">
          <A class="btn btn-ghost text-xl" href={"/"}>
            Foosball Tracker
          </A>
          <div class="flex gap-2">
            <MqttStatus />
            <ThemeSwitch />
          </div>
        </div>
        <div class="navbar-center flex">
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
      <div class={"flex-1 overflow-y-auto"}>{props.children}</div>
      {/*Actual Component rendered based on the route*/}
    </div>
  );
};

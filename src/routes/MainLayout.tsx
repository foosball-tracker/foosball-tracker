import { A } from "@solidjs/router";
import { MqttStatus } from "../components/MqttStatus.tsx";
import { ThemeSwitch } from "../components/ThemeSwitch.tsx";

export function MainLayout(props) {
  return (
    <>
      <div class="navbar bg-base-100 shadow-sm">
        <div class="navbar-start">
          <A class="btn btn-ghost text-xl" href={"/"}>
            Foosball Tracker
          </A>
        </div>
        <div class="navbar-center flex">
          <ul class="menu menu-horizontal px-1">
            <li>
              <A href={"/players"}>Players</A>
            </li>

            <li>
              <a>Item 3</a>
            </li>
          </ul>
        </div>
        <div class="navbar-end">
          <div class="flex gap-2">
            <MqttStatus />
            <ThemeSwitch />
          </div>
        </div>
      </div>
      {props.children}
    </>
  );
}

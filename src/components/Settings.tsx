import { Part, SetStoreFunction } from "solid-js/store";
import { ISettings } from "../types/Settings.ts";

interface SettingsProps {
  settings: ISettings;
  setSettings: SetStoreFunction<ISettings>;
}

export function Settings(props: SettingsProps) {
  const setTeamName = (
    event: InputEvent & {
      currentTarget: HTMLInputElement;
      target: HTMLInputElement;
    },
    path: Part<ISettings, keyof ISettings>
  ) => {
    props.setSettings(path, event.target.value);
  };

  return (
    <>
      <div class="card card-border bg-base-300">
        <div class="card-body">
          <h2 class="card-title">Settings</h2>
          <input
            class="input"
            type="text"
            placeholder={"Name Schwarzes Team"}
            value={props.settings.blackTeam}
            onInput={(event) => setTeamName(event, "blackTeam")}
          />
          <input
            class="input"
            type="text"
            placeholder={"Name Gelbes Team"}
            value={props.settings.yellowTeam}
            onInput={(e) => {
              props.setSettings("yellowTeam", e.target.value);
            }}
          />
        </div>
      </div>
    </>
  );
}

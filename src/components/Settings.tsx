import { SetStoreFunction } from "solid-js/store";
import { ISettings } from "../types/Settings.ts";

interface SettingsProps {
  settings: ISettings;
  setSettings: SetStoreFunction<ISettings>;
}

export function Settings(props: SettingsProps) {
  const setTeamName = (
    path: keyof ISettings,
    event: InputEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement }
  ) => {
    props.setSettings(path, event.target.value);
  };

  return (
    <>
      <div class="card card-border bg-base-300">
        <div class="card-body">
          <h2 class="card-title text-2xl">Settings</h2>
          <input
            class="input"
            type="text"
            placeholder={"Name Schwarzes Team"}
            value={props.settings.blackTeam}
            onInput={[setTeamName, "blackTeam"]}
          />
          <input
            class="input"
            type="text"
            placeholder={"Name Gelbes Team"}
            value={props.settings.yellowTeam}
            onInput={[setTeamName, "yellowTeam"]}
          />
          <input
            class="input"
            type="number"
            placeholder={"Tore zum Sieg"}
            value={props.settings.goalsToWin}
            onInput={(event) => props.setSettings("goalsToWin", parseInt(event.target.value))}
          />
        </div>
      </div>
    </>
  );
}

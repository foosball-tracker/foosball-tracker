import { createLocalStorageStore } from "../hooks/createLocalStorageStore.tsx";
import { ISettings } from "../types/Settings.ts";
import { MqttStatus } from "./MqttStatus.tsx";
import { ThemeSwitch } from "./ThemeSwitch.tsx";
import { ScoreBoard } from "./ScoreBoard.tsx";
import { GoalHistory } from "./GoalHistory.tsx";
import { Settings } from "./Settings.tsx";
import "../App.css";

export default function ProtectedApp() {
  const [settings, setSettings] = createLocalStorageStore<ISettings>("settings", {
    yellowTeam: "Gelbes Team",
    blackTeam: "Schwarzes Team",
    goalsToWin: 10,
  });

  return (
    <div class="flex min-h-screen flex-col p-4">
      <div class="flex justify-between pb-2">
        <div class="text-xl">Foosball Tracker</div>
        <div class="flex gap-2">
          <MqttStatus />
          <ThemeSwitch />
        </div>
      </div>

      <div class="flex flex-wrap gap-4">
        <div class="flex min-w-[250px] flex-1 flex-col gap-4">
          <ScoreBoard settings={settings} />
          <GoalHistory settings={settings} />
        </div>
        <div class="min-w-[250px] flex-1">
          <Settings settings={settings} setSettings={setSettings} />
        </div>
      </div>
    </div>
  );
}

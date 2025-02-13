import "./App.css";
import { ScoreBoard } from "./components/ScoreBoard.tsx";
import { Settings } from "./components/Settings.tsx";
import { GoalHistory } from "./components/GoalHistory.tsx";
import { ISettings } from "./types/Settings.ts";
import { ThemeSwitch } from "./components/ThemeSwitch.tsx";
import { createLocalStorageStore } from "./hooks/createLocalStorageStore.tsx";
import { MqttStatus } from "./components/MqttStatus.tsx";
import PasswordGate from "./components/PasswordGate.tsx";

function App() {
  const [settings, setSettings] = createLocalStorageStore<ISettings>("settings", {
    yellowTeam: "Gelbes Team",
    blackTeam: "Schwarzes Team",
  });

  return (
    <PasswordGate>
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
    </PasswordGate>
  );
}

export default App;

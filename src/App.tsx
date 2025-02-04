import "./App.css";
import { ScoreBoard } from "./components/ScoreBoard.tsx";
import { Settings } from "./components/Settings.tsx";
import { GoalHistory } from "./components/GoalHistory.tsx";
import { createStore } from "solid-js/store";
import { ISettings } from "./types/Settings.ts";
import { ThemeSwitch } from "./components/ThemeSwitch.tsx";

function App() {
  const [settings, setSettings] = createStore<ISettings>({
    yellowTeam: "Gelbes Team",
    blackTeam: "Schwarzes Team",
  });

  return (
    <div class="flex min-h-screen flex-col p-4">
      <div class="flex justify-between pb-2">
        <div>Foosball Tracker</div>
        <ThemeSwitch />
      </div>

      <div class="flex">
        <div class="flex w-2/3 flex-col gap-4">
          <ScoreBoard settings={settings} />
          <GoalHistory />
        </div>
        <div class="w-1/3">
          <Settings settings={settings} setSettings={setSettings} />
        </div>
      </div>
    </div>
  );
}

export default App;

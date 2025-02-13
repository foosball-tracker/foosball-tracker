import { For } from "solid-js";
import type { ISettings } from "../types/Settings";
import { gameState } from "../store/gameStore";

interface GoalHistoryProps {
  settings: ISettings;
}

export function GoalHistory(props: GoalHistoryProps) {
  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div class="card card-bordered bg-base-300 max-w-3xl">
      <div class="card-body">
        <h2 class="card-title">Goal History</h2>
        {/* Timeline container */}
        <div class="border-base-content/20 relative ml-6 border-l-2">
          <For each={gameState.goalHistory}>
            {(entry) => {
              const dotColor = entry.team === "black" ? "bg-neutral" : "bg-warning";

              return (
                <div class="relative mb-3 flex items-center space-x-4 pl-6">
                  {/* Timeline marker */}
                  <div
                    class={`absolute -left-6 h-3 w-3 ${dotColor} border-base-300 top-1/2 -translate-y-1/2 transform rounded-full border-2`}
                  />
                  {/* Team name in fixed width for alignment */}
                  <span class="w-64 truncate font-semibold">
                    {entry.team === "black" ? props.settings.blackTeam : props.settings.yellowTeam}
                  </span>
                  {/* Time badge */}
                  <span class="badge badge-sm badge-outline">{formatTime(entry.time)}</span>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
}

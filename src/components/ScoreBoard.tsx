import { ISettings } from "../types/Settings.ts";
import { onMount } from "solid-js";
import { mqttService } from "../service/mqttService.ts";
import { createLocalStorageSignal } from "../hooks/createLocalStorageSignal.tsx";
import { TeamScore } from "./TeamScore.tsx";

interface ScoreBoardProps {
  settings: ISettings;
}

const topic = "goal";

export function ScoreBoard(props: ScoreBoardProps) {
  const [scoreBlack, setScoreBlack] = createLocalStorageSignal("score_black", 0);
  const [scoreYellow, setScoreYellow] = createLocalStorageSignal("score_yellow", 0);

  onMount(() => {
    mqttService.subscribe(topic);

    const handleMessage = (msg: string) => {
      try {
        const data = JSON.parse(msg); // Parse JSON
        if (data.team === "black") {
          setScoreBlack((prev) => prev + data.value);
        } else if (data.team === "yellow") {
          setScoreYellow((prev) => prev + data.value);
        }
      } catch (error) {
        console.error("Failed to parse MQTT message:", msg, error);
      }
    };

    mqttService.on(topic, handleMessage);

    return () => {
      mqttService.off(topic, handleMessage);
      mqttService.unsubscribe(topic);
    };
  });

  return (
    <div class="card card-border bg-base-300 max-w-3xl">
      <div class="card-body">
        <h2 class="card-title text-2xl">Score</h2>
        <div class="flex items-center justify-center gap-8">
          <TeamScore
            teamName={props.settings.blackTeam}
            score={scoreBlack()}
            onUpdate={setScoreBlack}
          />
          <div class="text-3xl font-bold">:</div>
          <TeamScore
            teamName={props.settings.yellowTeam}
            score={scoreYellow()}
            onUpdate={setScoreYellow}
          />
        </div>
      </div>
    </div>
  );
}

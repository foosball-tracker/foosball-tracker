import { ScoreButton } from "./ScoreButton.tsx";
import { Setter } from "solid-js";

interface TeamScoreProps {
  teamName: string;
  score: number;
  onUpdate: Setter<number>;
}

export function TeamScore(props: TeamScoreProps) {
  return (
    <div class="flex flex-col items-center">
      <h3 class="sm:text-1xl text-xl font-bold md:text-3xl">{props.teamName}</h3>
      <div class="my-2 text-3xl font-bold">{props.score}</div>
      <div class="mt-1 flex gap-2">
        <ScoreButton onUpdate={props.onUpdate} />
        <ScoreButton direction={-1} onUpdate={props.onUpdate} />
      </div>
    </div>
  );
}

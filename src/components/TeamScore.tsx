import { ScoreButton } from "./ScoreButton.tsx";

interface TeamScoreProps {
  team: "black" | "yellow";
  teamName: string;
  score: number;
  updateScore: (inc: number) => void;
}

export function TeamScore(props: TeamScoreProps) {
  return (
    <div class="flex max-w-[12rem] flex-col items-center text-center break-words whitespace-normal">
      <h3 class="text-xl font-bold">{props.teamName}</h3>
      <div class="my-2 text-3xl font-bold">{props.score}</div>
      <div class="mt-1 flex gap-2">
        <ScoreButton direction={1} updateScore={() => props.updateScore(1)} />
        <ScoreButton direction={-1} updateScore={() => props.updateScore(-1)} />
      </div>
    </div>
  );
}

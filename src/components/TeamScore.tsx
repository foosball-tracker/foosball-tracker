import { ScoreButton } from "./ScoreButton.tsx";

interface TeamScoreProps {
  team: "black" | "yellow";
  teamName: string;
  score: number;
  updateScore: (inc: number) => void;
}

export function TeamScore(props: TeamScoreProps) {
  return (
    <div class="flex w-full max-w-[14rem] flex-col items-center text-center">
      <h3
        class="line-clamp-2 min-h-[2rem] overflow-hidden text-sm leading-tight font-bold md:text-xl"
        style={{ display: "-webkit-box", "-webkit-box-orient": "vertical" }}
      >
        {props.teamName}
      </h3>

      <div class="my-2 text-3xl font-bold">{props.score}</div>
      <div class="mt-1 flex gap-2">
        <ScoreButton direction={1} updateScore={() => props.updateScore(1)} />
        <ScoreButton direction={-1} updateScore={() => props.updateScore(-1)} />
      </div>
    </div>
  );
}

import { ScoreButton } from "./ScoreButton.tsx";

interface TeamScoreProps {
  disabled?: boolean;
  team: "black" | "yellow";
  teamName: string;
  score: number;
  updateScore: (inc: number) => void;
}

export function TeamScore(props: Readonly<TeamScoreProps>) {
  const initials = () =>
    props.teamName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

  return (
    <div class="flex w-full max-w-[14rem] flex-col items-center gap-4 text-center">
      <div class="avatar placeholder">
        <div
          class={`w-28 rounded-full border-4 ${
            props.team === "black" ? "border-neutral bg-base-100" : "border-success bg-base-100"
          } text-base-content sm:w-32`}
        >
          <span class="text-2xl font-black">{initials()}</span>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-center gap-2">
          <span
            class={`status status-lg ${props.team === "black" ? "status-neutral" : "status-warning"} `}
          />
        </div>
        <h3
          class="line-clamp-2 min-h-[2rem] overflow-hidden text-lg leading-tight font-black md:text-xl"
          style={{ display: "-webkit-box", "-webkit-box-orient": "vertical" }}
        >
          {props.teamName}
        </h3>
      </div>

      <div class="text-7xl font-black sm:text-8xl">{props.score}</div>
      <div class="mt-1 flex gap-2">
        <ScoreButton
          direction={1}
          disabled={props.disabled}
          updateScore={() => props.updateScore(1)}
        />
        <ScoreButton
          direction={-1}
          disabled={props.disabled}
          updateScore={() => props.updateScore(-1)}
        />
      </div>
    </div>
  );
}

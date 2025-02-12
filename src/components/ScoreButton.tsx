import { JSX } from "solid-js";
import { playGoalSound } from "../service/soundService.ts";

interface ScoreButtonProps {
  direction: number;
  updateScore: (inc: number) => void;
}

export function ScoreButton(props: ScoreButtonProps): JSX.Element {
  const handleClick = () => {
    playGoalSound();
    props.updateScore(props.direction);
  };

  return (
    <button
      class={`btn btn-circle ${props.direction === -1 ? "btn-error" : "btn-primary"}`}
      onClick={handleClick}
    >
      {props.direction === -1 ? "-" : "+"}
    </button>
  );
}

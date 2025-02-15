import { JSX } from "solid-js";
import { gameState } from "../store/gameStore.ts";

interface ScoreButtonProps {
  direction: number;
  updateScore: (inc: number) => void;
}

export function ScoreButton(props: ScoreButtonProps): JSX.Element {
  const handleClick = () => {
    props.updateScore(props.direction);
  };

  return (
    <button
      class={`btn btn-circle ${props.direction === -1 ? "btn-error" : "btn-primary"}`}
      disabled={!gameState.gameRunning}
      onClick={handleClick}
    >
      {props.direction === -1 ? "-" : "+"}
    </button>
  );
}

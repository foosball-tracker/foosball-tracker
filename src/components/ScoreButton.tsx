import type { JSX } from "solid-js";

interface ScoreButtonProps {
  disabled?: boolean;
  direction: number;
  updateScore: (inc: number) => void;
}

export function ScoreButton(props: Readonly<ScoreButtonProps>): JSX.Element {
  const handleClick = () => {
    props.updateScore(props.direction);
  };

  return (
    <button
      class={`btn btn-circle ${props.direction === -1 ? "btn-soft" : "btn-primary"}`}
      aria-label={props.direction === -1 ? "Remove goal" : "Add goal"}
      disabled={props.disabled}
      onClick={handleClick}
      type="button"
    >
      {props.direction === -1 ? "-" : "+"}
    </button>
  );
}

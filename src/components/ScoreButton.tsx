import { JSX, Setter } from "solid-js";

interface ScoreButtonProps {
  direction?: 1 | -1; // Default is 1 (increment)
  onUpdate: Setter<number>;
}

export function ScoreButton(props: ScoreButtonProps): JSX.Element {
  const handleClick = () => {
    props.onUpdate((prev) => prev + (props.direction ?? 1)); // Ensure Solid tracks the state update properly
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

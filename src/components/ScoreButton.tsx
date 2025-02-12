import { JSX, mergeProps, Setter } from "solid-js";
import { playGoalSound } from "../service/soundService.ts";

interface ScoreButtonProps {
  direction?: 1 | -1; // Default is 1 (increment)
  onUpdate: Setter<number>;
}

export function ScoreButton(passedProps: ScoreButtonProps): JSX.Element {
  const props = mergeProps({ direction: 1 }, passedProps);

  const handleClick = () => {
    const increment = props.direction;
    playGoalSound();
    props.onUpdate((prev) => prev + increment);
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

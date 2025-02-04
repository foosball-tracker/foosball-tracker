import { ISettings } from "../types/Settings.ts";

interface ScoreBoardProps {
  settings: ISettings;
}

export function ScoreBoard(props: ScoreBoardProps) {
  return (
    <>
      <div class="card card-border bg-base-300 w-3xl">
        <div class="card-body">
          <h2 class="card-title">Score</h2>
          <div class="flex justify-between">
            <div>
              <h3>{props.settings.blackTeam}</h3>
              <div>0</div>
            </div>
            <div>
              <h3>{props.settings.yellowTeam}</h3>
              <div>0</div>
            </div>
          </div>
          <div class="card-actions justify-between">
            <div class="flex gap-2">
              <button class="btn btn-circle btn-primary">+</button>
              <button class="btn btn-circle btn-primary">-</button>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-circle btn-primary">+</button>
              <button class="btn btn-circle btn-primary">-</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

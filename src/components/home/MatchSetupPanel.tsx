import type { SetStoreFunction } from "solid-js/store";
import { CirclePlay, Goal, Shield } from "lucide-solid";
import Select from "~/components/shared/Select.tsx";
import type { ISettings } from "~/types/Settings";
import type { Tables } from "~/types/database";

interface MatchSetupPanelProps {
  onStartGame: () => Promise<void>;
  settings: ISettings;
  setSettings: SetStoreFunction<ISettings>;
  teamOptions: Tables<"teams">[];
}

export function MatchSetupPanel(props: Readonly<MatchSetupPanelProps>) {
  const options = () =>
    props.teamOptions.map((team) => ({
      value: team.id,
      label: team.type === "player" ? `${team.name} (Player)` : `${team.name} (Team)`,
    }));

  return (
    <section class="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)]">
      <div class="card border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-6 p-6 sm:p-8">
          <div class="space-y-3">
            <p class="text-base-content/60 text-xs font-semibold tracking-[0.24em] uppercase">
              Start match
            </p>
            <h2 class="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
              Set the teams, lock the target score, and start play fast.
            </h2>
            <p class="text-base-content/70 max-w-2xl text-sm sm:text-base">
              This setup stays focused on the table: pick both sides, set the winning total, and
              jump straight into the live board.
            </p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-box bg-base-200 space-y-4 p-4">
              <div class="flex items-center gap-3">
                <div class="bg-warning/20 text-warning rounded-full p-2">
                  <Shield class="h-5 w-5" />
                </div>
                <div>
                  <p class="font-semibold">Yellow side</p>
                  <p class="text-base-content/60 text-sm">Choose a player or team</p>
                </div>
              </div>
              <Select
                class="select-bordered w-full"
                legend="Yellow team"
                onChange={(value, option) =>
                  props.setSettings("yellowTeam", { id: value, name: option.label })
                }
                options={options()}
                placeholder="Select a team"
                value={props.settings.yellowTeam.id}
              />
            </div>

            <div class="rounded-box bg-base-200 space-y-4 p-4">
              <div class="flex items-center gap-3">
                <div class="bg-neutral/10 text-neutral rounded-full p-2">
                  <Shield class="h-5 w-5" />
                </div>
                <div>
                  <p class="font-semibold">Black side</p>
                  <p class="text-base-content/60 text-sm">Choose a player or team</p>
                </div>
              </div>
              <Select
                class="select-bordered w-full"
                legend="Black team"
                onChange={(value, option) =>
                  props.setSettings("blackTeam", { id: value, name: option.label })
                }
                options={options()}
                placeholder="Select a team"
                value={props.settings.blackTeam.id}
              />
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-[minmax(0,16rem)_1fr]">
            <fieldset class="fieldset rounded-box bg-base-200 p-4">
              <legend class="fieldset-legend flex items-center gap-2 text-sm font-semibold">
                <Goal class="h-4 w-4" />
                Goals to win
              </legend>
              <input
                class="input input-bordered w-full text-lg font-semibold"
                min="1"
                onInput={(event) =>
                  props.setSettings(
                    "goalsToWin",
                    Math.max(1, Number.parseInt(event.currentTarget.value || "1", 10))
                  )
                }
                type="number"
                value={props.settings.goalsToWin}
              />
            </fieldset>

            <div class="rounded-box bg-base-200 flex flex-col justify-between gap-4 p-4">
              <div class="space-y-2">
                <p class="text-base-content/60 text-xs font-semibold tracking-[0.24em] uppercase">
                  Match summary
                </p>
                <div class="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                  <span class="badge badge-warning badge-outline">Yellow</span>
                  <span class="font-semibold">
                    {props.settings.yellowTeam.name || "Unselected"}
                  </span>
                  <span class="text-base-content/40">vs</span>
                  <span class="badge badge-outline">Black</span>
                  <span class="font-semibold">{props.settings.blackTeam.name || "Unselected"}</span>
                </div>
              </div>

              <button
                class="btn btn-primary btn-lg gap-2 self-start"
                onClick={() => void props.onStartGame()}
              >
                <CirclePlay class="h-5 w-5" />
                Start game
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside class="card border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-5 p-6">
          <div>
            <p class="text-base-content/60 text-xs font-semibold tracking-[0.24em] uppercase">
              Design cues
            </p>
            <h3 class="mt-2 text-2xl font-black tracking-tight">Pre-match flow</h3>
          </div>

          <ul class="space-y-3 text-sm leading-6">
            <li class="rounded-box bg-base-200 p-3">
              Keep the flow one-handed and obvious on mobile. Inputs stack, CTA stays prominent.
            </li>
            <li class="rounded-box bg-base-200 p-3">
              The winning score is a first-class decision, not a buried advanced setting.
            </li>
            <li class="rounded-box bg-base-200 p-3">
              Team identity stays semantic: names carry the detail, tokens carry the color.
            </li>
          </ul>
        </div>
      </aside>
    </section>
  );
}

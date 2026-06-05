import { createEffect, createMemo } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { CirclePlay, Goal, Shield } from "lucide-solid";
import Select from "~/components/shared/Select.tsx";
import type { ISettings } from "~/types/Settings";
import type { Tables } from "~/types/database";

interface MatchSetupPanelProps {
  backendReady: boolean;
  onStartGame: () => Promise<void>;
  settings: ISettings;
  setSettings: SetStoreFunction<ISettings>;
  teamOptions: Tables<"teams">[];
  currentPlayerId: number | null;
  currentPlayerTeamIds: number[];
}

export function MatchSetupPanel(props: Readonly<MatchSetupPanelProps>) {
  const ownTeamIds = createMemo(() => {
    const ids = new Set(props.currentPlayerTeamIds);
    for (const team of props.teamOptions) {
      if (team.type === "player" && team.player_id === props.currentPlayerId) {
        ids.add(team.id);
      }
    }
    return ids;
  });

  const options = () => {
    const ownIds = ownTeamIds();
    return [...props.teamOptions]
      .sort((a, b) => {
        const aOwn = ownIds.has(a.id);
        const bOwn = ownIds.has(b.id);
        if (aOwn && !bOwn) return -1;
        if (!aOwn && bOwn) return 1;
        return 0;
      })
      .map((team) => {
        const isOwn = ownIds.has(team.id);
        const label = team.type === "player" ? `${team.name} (Player)` : `${team.name} (Team)`;
        return { value: team.id, label: isOwn ? `${team.name} (You)` : label, highlighted: isOwn };
      });
  };

  const yellowTeamId = () => props.settings.yellowTeam.id;
  const blackTeamId = () => props.settings.blackTeam.id;

  const yellowOptions = () =>
    options().map((opt) => ({
      ...opt,
      disabled: opt.value === blackTeamId(),
    }));

  const blackOptions = () =>
    options().map((opt) => ({
      ...opt,
      disabled: opt.value === yellowTeamId(),
    }));

  const selectedName = (name: string) => name || "Select team";
  const canStartMatch = () =>
    Boolean(
      props.backendReady &&
      props.settings.yellowTeam.id &&
      props.settings.blackTeam.id &&
      props.settings.yellowTeam.id !== props.settings.blackTeam.id &&
      options().length
    );
  const optionById = (opts: { value: number; label: string }[], id: number | undefined) =>
    opts.find((option) => option.value === id);

  createEffect(() => {
    const availableOptions = options();
    if (!availableOptions.length) return;

    const yellowTeam = props.settings.yellowTeam;
    const blackTeam = props.settings.blackTeam;

    const yellowOption = optionById(availableOptions, yellowTeam.id) ?? availableOptions[0];
    const blackOption =
      optionById(availableOptions, blackTeam.id) ??
      availableOptions.find((o) => o.value !== yellowOption.value) ??
      yellowOption;

    if (yellowOption.value !== yellowTeam.id || yellowOption.label !== yellowTeam.name) {
      props.setSettings("yellowTeam", { id: yellowOption.value, name: yellowOption.label });
    }

    if (blackOption.value !== blackTeam.id || blackOption.label !== blackTeam.name) {
      props.setSettings("blackTeam", { id: blackOption.value, name: blackOption.label });
    }
  });

  return (
    <section class="mx-auto w-full max-w-6xl">
      <div class="card border-base-300 bg-base-100 text-base-content [html[data-theme=dim]_&]:bg-neutral [html[data-theme=dim]_&]:text-neutral-content shadow-sm">
        <div class="card-body gap-5 p-4 sm:p-5 lg:p-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-base-content/60 [html[data-theme=dim]_&]:text-neutral-content/70 text-xs font-semibold tracking-[0.24em] uppercase">
                Scoreboard
              </p>
              <h2 class="text-2xl font-black tracking-tight sm:text-3xl">Start match</h2>
            </div>
            <div class="text-base-content/60 [html[data-theme=dim]_&]:text-neutral-content/70 flex items-center gap-2 text-sm">
              <span class="status status-warning" />
              <span>Yellow</span>
              <span class="opacity-50">vs</span>
              <span class="status status-neutral [html[data-theme=dim]_&]:border-neutral-content/40 [html[data-theme=dim]_&]:border" />
              <span>Black</span>
            </div>
          </div>

          <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.72fr)_minmax(0,1fr)] lg:gap-6">
            <div class="rounded-box bg-base-200 [html[data-theme=dim]_&]:bg-base-100/10 flex flex-col items-center gap-4 p-4 sm:p-5">
              <div class="bg-warning text-warning-content border-warning-content/30 flex aspect-square w-32 flex-col items-center justify-center rounded-full border-4 p-4 text-center sm:w-40">
                <Shield class="mb-2 h-8 w-8" />
                <span class="line-clamp-3 text-sm leading-tight font-black sm:text-base">
                  {selectedName(props.settings.yellowTeam.name)}
                </span>
              </div>
              <Select
                aria-label="Yellow team"
                class="select-bordered w-full"
                onChange={(value, option) =>
                  props.setSettings("yellowTeam", { id: value, name: option.label })
                }
                options={yellowOptions()}
                placeholder="Select yellow team"
                value={props.settings.yellowTeam.id}
              />
            </div>

            <div class="rounded-box bg-base-200 [html[data-theme=dim]_&]:bg-base-100/10 flex flex-col justify-between gap-4 p-4 sm:p-5">
              {!props.backendReady && (
                <div class="alert alert-error text-sm">
                  Connected Supabase backend is missing required migrations for match tracking on
                  this branch.
                </div>
              )}
              <fieldset class="fieldset m-0 p-0">
                <legend class="fieldset-legend text-base-content [html[data-theme=dim]_&]:text-neutral-content flex items-center gap-2 pb-2 text-sm font-semibold">
                  <Goal class="h-4 w-4" />
                  Goals to win
                </legend>
                <input
                  class="input input-bordered w-full text-center text-3xl font-black"
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

              <div class="text-base-content/70 [html[data-theme=dim]_&]:text-neutral-content/75 text-center text-sm">
                <span class="font-semibold">{props.settings.yellowTeam.name || "Unselected"}</span>
                <span class="px-2 opacity-60">vs</span>
                <span class="font-semibold">{props.settings.blackTeam.name || "Unselected"}</span>
              </div>

              <button
                class="btn btn-primary btn-lg w-full gap-2"
                disabled={!canStartMatch()}
                onClick={() => void props.onStartGame()}
              >
                <CirclePlay class="h-5 w-5" />
                Start match
              </button>
            </div>

            <div class="rounded-box bg-base-200 [html[data-theme=dim]_&]:bg-base-100/10 flex flex-col items-center gap-4 p-4 sm:p-5">
              <div class="bg-neutral text-neutral-content border-neutral-content/30 flex aspect-square w-32 flex-col items-center justify-center rounded-full border-4 p-4 text-center sm:w-40">
                <Shield class="mb-2 h-8 w-8" />
                <span class="line-clamp-3 text-sm leading-tight font-black sm:text-base">
                  {selectedName(props.settings.blackTeam.name)}
                </span>
              </div>
              <Select
                aria-label="Black team"
                class="select-bordered w-full"
                onChange={(value, option) =>
                  props.setSettings("blackTeam", { id: value, name: option.label })
                }
                options={blackOptions()}
                placeholder="Select black team"
                value={props.settings.blackTeam.id}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

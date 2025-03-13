import { createMemo, createResource } from "solid-js";
import { Tables } from "~/types/database.ts";
import { getTeams } from "~/components/teams/Teams.tsx";
import Select, { Option } from "~/components/shared/Select.tsx";
import { SettingsProps } from "~/components/Settings.tsx";

export default function SettingsForm(props: SettingsProps) {
  const [teams] = createResource(getTeams);

  // Memoize transformed options.
  const teamOptions = createMemo<Option<number>[]>(() => {
    const loadedTeams = teams();
    if (!loadedTeams) {
      return [];
    }
    return loadedTeams?.map((team: Tables<"teams">) => ({
      value: team.id,
      label: team.name,
    }));
  });

  return (
    <>
      <Select
        value={props.settings.yellowTeam.id}
        onChange={(value, option) =>
          props.setSettings("yellowTeam", { id: value, name: option.label })
        }
        legend="Gelbes Team"
        options={teamOptions()}
        placeholder="Select a Team"
        class="select-bordered w-full"
      />
      <Select
        value={props.settings.blackTeam.id}
        onChange={(value, option) =>
          props.setSettings("blackTeam", { id: value, name: option.label })
        }
        legend="Schwarzes Team"
        options={teamOptions()}
        placeholder="Select a Team"
        class="select-bordered w-full"
      />
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Tore zum Sieg</legend>
        <input
          class="input"
          type="number"
          placeholder="Tore zum Sieg"
          value={props.settings.goalsToWin}
          onInput={(event) => props.setSettings("goalsToWin", parseInt(event.currentTarget.value))}
        />
      </fieldset>
    </>
  );
}

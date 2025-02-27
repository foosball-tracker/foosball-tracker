import { createMemo, createResource } from "solid-js";
import { Tables } from "~/types/database.ts";
import { getTeams } from "~/components/teams/Teams.tsx";
import Select, { Option } from "~/components/shared/Select.tsx";
import { SettingsProps } from "~/components/Settings.tsx";

export default function SettingsForm(props: SettingsProps) {
  const [teams] = createResource(getTeams);

  // Memoize transformed options.
  const teamOptions = createMemo<Option[]>(() => {
    const loadedTeams = teams();
    if (!loadedTeams) {
      return [];
    }
    return loadedTeams?.map((team: Tables<"teams">) => ({
      value: team.name,
      label: team.name,
    }));
  });

  return (
    <>
      <Select
        value={props.settings.yellowTeam}
        onChange={(value) => props.setSettings("yellowTeam", value)}
        legend="Gelbes Team"
        options={teamOptions()}
        placeholder="Select a Team"
        class="select-bordered w-full"
      />
      <Select
        value={props.settings.blackTeam}
        onChange={(value) => props.setSettings("blackTeam", value)}
        legend="Schwarzes Team"
        options={teamOptions()}
        placeholder="Select a Team"
        class="select-bordered w-full"
      />
      <input
        class="input"
        type="number"
        placeholder="Tore zum Sieg"
        value={props.settings.goalsToWin}
        onInput={(event) => props.setSettings("goalsToWin", parseInt(event.currentTarget.value))}
      />
    </>
  );
}

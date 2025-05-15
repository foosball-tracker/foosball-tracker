import { createSignal, createResource, JSX, Match, Show, Switch, For } from "solid-js";
import Spinner from "../shared/Spinner";
import { createTeam } from "~/service/teamService";
import { fetchPlayers } from "~/service/playerService";

interface TeamFormProps {
  onSuccess?: () => void;
}

export default function TeamForm(props: Readonly<TeamFormProps>) {
  const [name, setName] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = createSignal<number[]>([]);

  const [players] = createResource(fetchPlayers);

  const handleSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      if (!name().trim()) {
        throw new Error("Name is required");
      }
      if (selectedPlayerIds().length === 0) {
        throw new Error("Add at least one player");
      }

      await createTeam({
        name: name().trim(),
        playerIds: selectedPlayerIds(),
      });

      setName("");
      setSelectedPlayerIds([]);
      setSuccess(true);
      props.onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayerSelect: JSX.EventHandler<HTMLSelectElement, Event> = (e) => {
    const value = parseInt(e.currentTarget.value);
    if (!isNaN(value) && !selectedPlayerIds().includes(value)) {
      if (selectedPlayerIds().length < 2) {
        setSelectedPlayerIds([...selectedPlayerIds(), value]);
      } else {
        setError("You can only select up to 2 players");
      }
    }
    e.currentTarget.value = "";
  };

  const removePlayer = (id: number) => {
    setSelectedPlayerIds(selectedPlayerIds().filter((pid) => pid !== id));
  };

  return (
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Add New Team</h2>
        <form onSubmit={handleSubmit}>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Team Name</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              placeholder="Enter team name"
              disabled={isSubmitting()}
            />
          </fieldset>

          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Select Players</legend>
            <select
              class="input input-bordered w-full"
              onChange={handlePlayerSelect}
              disabled={isSubmitting()}
            >
              <option value="">Select player...</option>
              <For each={players() ?? []}>
                {(player) => <option value={player.id}>{player.name}</option>}
              </For>
            </select>
          </fieldset>

          <div class="mt-2 flex flex-wrap gap-2">
            <For each={selectedPlayerIds()}>
              {(id) => {
                const player = players()?.find((p) => p.id === id);
                return (
                  <div class="badge badge-primary gap-2 p-3">
                    {player?.name ?? "Unknown"}
                    <button
                      type="button"
                      class="btn btn-xs btn-circle btn-error ml-2"
                      onClick={() => removePlayer(id)}
                    >
                      ✕
                    </button>
                  </div>
                );
              }}
            </For>
          </div>

          <div class="mt-2">
            <Switch>
              <Match when={error()}>
                <div class="alert alert-error">{error()}</div>
              </Match>
              <Match when={success()}>
                <div class="alert alert-success">Team created successfully!</div>
              </Match>
            </Switch>
          </div>

          <div class="card-actions mt-4 justify-end">
            <button type="submit" class="btn btn-primary" disabled={isSubmitting()}>
              <Show when={isSubmitting()} fallback={"Create Team"}>
                <Spinner />
              </Show>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

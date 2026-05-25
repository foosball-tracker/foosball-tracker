import { useNavigate } from "@solidjs/router";
import { createSignal, JSX, Match, Show, Switch } from "solid-js";
import { createPlayer } from "../../service/playerService";
import Spinner from "../shared/Spinner";
import { usePlayerListContext } from "./PlayerListContext";

export default function PlayerForm() {
  const navigate = useNavigate();
  const playerList = usePlayerListContext();
  const [name, setName] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal(false);

  // prettier-ignore
  const handleSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (e) => {// NOSONAR
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      if (!name().trim()) {
        throw new Error("Name is required");
      }

      await createPlayer({ name: name().trim() });
      playerList?.refetchPlayers();
      setName("");
      setSuccess(true);
      setTimeout(() => {
        navigate("/players");
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create player");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Add New Player</h2>
        <form onSubmit={handleSubmit}>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Player Name</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              placeholder="Enter player name"
              disabled={isSubmitting()}
            />
          </fieldset>

          <div class="mt-2">
            <Switch>
              <Match when={error()}>
                <div class="alert alert-error">{error()}</div>
              </Match>
              <Match when={success()}>
                <div class="alert alert-success">Player created successfully!</div>
              </Match>
            </Switch>
          </div>

          <div class="card-actions mt-4 justify-end">
            <button
              type="button"
              class="btn"
              onClick={() => navigate("/players")}
              disabled={isSubmitting()}
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" disabled={isSubmitting()}>
              <Show when={isSubmitting()} fallback={"Create Player"}>
                <Spinner />
              </Show>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

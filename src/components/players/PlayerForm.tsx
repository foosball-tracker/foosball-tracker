import { createSignal, JSX } from "solid-js";
import { createPlayer } from "../../service/playerService";
import Spinner from "../shared/Spinner";

interface PlayerFormProps {
  onSuccess?: () => void;
}

export default function PlayerForm(props: Readonly<PlayerFormProps>) {
  const [name, setName] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal(false);

  const handleSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      if (!name().trim()) {
        throw new Error("Name is required");
      }

      await createPlayer({ name: name().trim() });
      setName("");
      setSuccess(true);
      props.onSuccess?.();
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

          {error() && <div class="alert alert-error mt-2">{error()}</div>}
          {success() && (
            <div class="alert alert-success mt-2">Player created successfully!</div>
          )}

          <div class="card-actions justify-end mt-4">
            <button
              type="submit"
              class="btn btn-primary"
              disabled={isSubmitting()}
            >
              {isSubmitting() ? (
                <>
                 <Spinner/>
              
                </>
              ) : (
                "Create Player"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
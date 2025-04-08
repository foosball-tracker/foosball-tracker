import { createSignal, Show } from "solid-js";
import { deletePlayer } from "~/service/playerService";
import Spinner from "../shared/Spinner";

interface ConfirmDeleteProps {
  showConfirm: boolean;
  playerToDelete: { id: number; name: string } | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ConfirmDelete = (props: ConfirmDeleteProps) => {
  const [isDeleting, setIsDeleting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleConfirm = async () => {
    if (!props.playerToDelete) return;
    setIsDeleting(true);
    setError(null);

    try {
      await deletePlayer(props.playerToDelete.id);
      props.onSuccess?.();
      props.onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete player");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    props.onCancel();
  };

  return (
    <Show when={props.showConfirm}>
      <div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div class="bg-base-300 w-80 rounded-lg p-6 shadow-lg">
          <h2 class="text-base-content mb-4 text-lg font-semibold">Confirm Delete</h2>
          <p class="text-base-content mb-4">
            Are you sure you want to delete <strong>{props.playerToDelete?.name}</strong>?
          </p>
          {error() && <div class="alert alert-error mt-2">Delete Failed!</div>}

          <div class="mt-2 flex justify-end gap-2">
            <button class="btn btn-outline" onClick={handleCancel} disabled={isDeleting()}>
              Cancel
            </button>
            <button class="btn btn-error" onClick={handleConfirm} disabled={isDeleting()}>
              {isDeleting() ? <Spinner /> : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default ConfirmDelete;

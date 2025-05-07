import { createSignal, Show } from "solid-js";
import Spinner from "./Spinner";

interface ConfirmDeleteModalProps<T> {
  showConfirm: boolean;
  entityToDelete: T | null;
  onCancel: () => void;
  onSuccess: () => void;
  onDelete: (id: number) => Promise<void>;
  getName: (entity: T) => string;
}

const ConfirmDeleteModal = <T extends { id: number }>(props: ConfirmDeleteModalProps<T>) => {
  const [isDeleting, setIsDeleting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleConfirm = async () => {
    if (!props.entityToDelete) return;
    setIsDeleting(true);
    setError(null);

    try {
      await props.onDelete(props.entityToDelete.id);
      props.onSuccess?.();
      props.onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
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
            Are you sure you want to delete <strong>{props.entityToDelete && props.getName(props.entityToDelete)}</strong>?
          </p>
          {error() && <div class="alert alert-error mt-2">{error()}</div>}

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

export default ConfirmDeleteModal;


import { createSignal, Show } from "solid-js";
import { deletePlayer } from "~/service/playerService";
import Spinner from "../shared/Spinner";

interface ConfirmDeleteProps {
  showConfirm: boolean;
  playerToDelete: {id: number, name: string } | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ConfirmDelete = (props: ConfirmDeleteProps) => {
  const [isDeleting, setIsDeleting] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  const handleConfirm = async()=>{
    if(!props.playerToDelete) return;
    setIsDeleting(true)
    setError(null)

    try{
      await deletePlayer(props.playerToDelete.id);
      props.onSuccess?.();
      props.onCancel();
    }catch(err){
      setError(err instanceof Error ? err.message : "Failed to delete player");
    }finally{
      setIsDeleting(false);
    }
  };

  const handleCancel = ()=>{
    setError(null);
    props.onCancel();
  }

  return (
    <Show when={props.showConfirm}>
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-base-300 p-6 rounded-lg shadow-lg w-80">
          <h2 class="text-lg font-semibold mb-4 text-base-content">Confirm Delete</h2>
          <p class="mb-4 text-base-content">
            Are you sure you want to delete <strong>{props.playerToDelete?.name}</strong>?
          </p>
          {error() && <div class="alert alert-error mt-2">Delete Failed!</div>}

          <div class="flex justify-end gap-2 mt-2">
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

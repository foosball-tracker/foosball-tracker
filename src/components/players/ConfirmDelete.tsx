
import {  Show } from "solid-js";

interface ConfirmDeleteProps {
  showConfirm: boolean;
  playerToDelete: { name: string } | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDelete = (props: ConfirmDeleteProps) => {
  return (
    <Show when={props.showConfirm}>
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-base-300 p-6 rounded-lg shadow-lg w-80">
          <h2 class="text-lg font-semibold mb-4">Confirm Delete</h2>
          <p class="mb-4">
            Are you sure you want to delete <strong>{props.playerToDelete?.name}</strong>?
          </p>
          <div class="flex justify-end gap-2">
            <button class="btn btn-outline" onClick={props.onCancel}>
              Cancel
            </button>
            <button class="btn btn-error" onClick={props.onConfirm}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default ConfirmDelete;

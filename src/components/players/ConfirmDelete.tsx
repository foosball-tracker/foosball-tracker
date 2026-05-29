import ConfirmDeleteModal from "../shared/ConfirmDeleteModal";
import { deletePlayer } from "~/service/playerService";

const ConfirmDelete = (props: {
  showConfirm: boolean;
  playerToDelete: { id: number; name: string } | null;
  onCancel: () => void;
  onSuccess: () => void;
}) => (
  <ConfirmDeleteModal
    showConfirm={props.showConfirm}
    entityToDelete={props.playerToDelete}
    onCancel={props.onCancel}
    onSuccess={props.onSuccess}
    onDelete={deletePlayer}
    getName={(player) => player.name}
  />
);

export default ConfirmDelete;

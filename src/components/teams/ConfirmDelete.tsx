import ConfirmDeleteModal from "../shared/ConfirmDeleteModal";
import { deleteTeam } from "~/service/teamService";

const ConfirmTeamDelete = (props: {
  showConfirm: boolean;
  teamToDelete: { id: number; name: string } | null;
  onCancel: () => void;
  onSuccess: () => void;
}) => (
  <ConfirmDeleteModal
    showConfirm={props.showConfirm}
    entityToDelete={props.teamToDelete}
    onCancel={props.onCancel}
    onSuccess={props.onSuccess}
    onDelete={deleteTeam}
    getName={(team) => team.name}
  />
);

export default ConfirmTeamDelete;

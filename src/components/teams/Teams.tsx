import { supabase } from "~/service/supabaseService.ts";
import { createResource, createSignal, Show } from "solid-js";
import { ColumnDef } from "@tanstack/solid-table";
import { Tables } from "~/types/database.ts";
import { DataTable } from "~/components/shared/table/DataTable.tsx";
import TeamForm from "./TeamForm";
import ConfirmTeamDelete from "./ConfirmDelete";

const ARTIFICIAL_DELAY_MS = 1000;
interface Team {
  id: number;
  name: string;
}

const [showTeamForm, setShowTeamForm] = createSignal(false);
const [showConfirm, setShowConfirm] = createSignal(false);
const [teamToDelete, setTeamToDelete] = createSignal<Team | null>(null);

export const getTeams = async () => {
  // Add artificial delay for testing purposes
  await new Promise((resolve) => setTimeout(resolve, ARTIFICIAL_DELAY_MS));

  const { data, error } = await supabase.from("teams").select().eq("type", "team");
  if (error) {
    console.error("error fetching teams", error);
  }
  return data ?? [];
};

const columns: ColumnDef<Tables<"teams">>[] = [
  {
    header: "Actions",
    cell: (info) => {
      const team = info.row.original;
      return (
        <button
          class="btn btn-error btn-sm"
          onClick={() => {
            setTeamToDelete(team);
            setShowConfirm(true);
          }}
        >
          Delete
        </button>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
];

export default function Teams() {
  const [data, { refetch }] = createResource(getTeams);

  const handleCreateTeamSuccess = () => {
    refetch();
    setTimeout(() => {
      setShowTeamForm(false);
    }, 1000);
  };

  return (
    <>
      <Show
        when={!showTeamForm()}
        keyed
        fallback={<TeamForm onSuccess={handleCreateTeamSuccess} />}
      >
        <div class={"p-2"}>
          <div class={"text-lg"}>Teams</div>
          <div class="mx-auto w-full">
            <Show
              when={data()}
              keyed
              fallback={
                <div class={"flex h-full items-center justify-center"}>
                  <span class="loading loading-spinner loading-xl" />
                </div>
              }
            >
              {(resolvedData) => <DataTable columns={columns} data={resolvedData} />}
            </Show>
          </div>
          <button
            class="btn btn-primary mx-auto mt-4"
            onClick={() => setShowTeamForm(!showTeamForm())}
          >
            Create New Team
          </button>
        </div>
      </Show>
      <ConfirmTeamDelete
        showConfirm={showConfirm()}
        teamToDelete={teamToDelete()}
        onCancel={() => {
          setShowConfirm(false);
          setTeamToDelete(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
    </>
  );
}

import { A } from "@solidjs/router";
import type { RouteSectionProps } from "@solidjs/router";
import { hasSupabaseConfig } from "~/service/supabaseService.ts";
import { createResource, createSignal, Show, For } from "solid-js";
import { ColumnDef } from "@tanstack/solid-table";
import { DataTable } from "~/components/shared/table/DataTable.tsx";
import ConfirmTeamDelete from "./ConfirmDelete";
import { getTeamsWithMembers, TeamWithMembers } from "~/service/teamService";
import { TeamListContext } from "./TeamListContext";

const [showConfirm, setShowConfirm] = createSignal(false);
const [teamToDelete, setTeamToDelete] = createSignal<TeamWithMembers | null>(null);

const columns: ColumnDef<TeamWithMembers>[] = [
  {
    header: "Actions",
    cell: (info) => {
      const team = info.row.original;
      return (
        <div class="flex gap-2">
          <A class="btn btn-outline btn-sm" href={`/teams/edit/${team.id}`}>
            Edit
          </A>
          <button
            class="btn btn-soft btn-error btn-sm"
            onClick={() => {
              setTeamToDelete(team);
              setShowConfirm(true);
            }}
          >
            Delete
          </button>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    header: "Members",
    cell: (info) => {
      const team = info.row.original;
      const members = team.team_members ?? [];
      return (
        <div class="flex flex-wrap gap-1">
          <For each={members}>
            {(member) => (
              <span class="badge badge-sm badge-outline">{member.players?.name ?? "Unknown"}</span>
            )}
          </For>
        </div>
      );
    },
  },
];

export default function Teams(props: RouteSectionProps) {
  const [data, { refetch }] = createResource(getTeamsWithMembers);

  return (
    <Show
      when={hasSupabaseConfig()}
      fallback={
        <div class="alert alert-info m-4">
          <span>Supabase is not configured. Team management is unavailable.</span>
        </div>
      }
    >
      <TeamListContext.Provider value={{ refetchTeams: refetch }}>
        <div class="p-2">
          <div class="text-lg">Teams</div>
          <div class="mx-auto w-full">
            <Show
              when={data()}
              keyed
              fallback={
                <div class="flex h-full items-center justify-center">
                  <span class="loading loading-spinner loading-xl" />
                </div>
              }
            >
              {(resolvedData) => <DataTable columns={columns} data={resolvedData} />}
            </Show>
          </div>
          <A class="btn btn-primary mx-auto mt-4 inline-block" href="/teams/new">
            Create New Team
          </A>
        </div>

        {props.children}

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
      </TeamListContext.Provider>
    </Show>
  );
}

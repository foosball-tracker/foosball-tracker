import { A } from "@solidjs/router";
import type { RouteSectionProps } from "@solidjs/router";
import { hasSupabaseConfig } from "~/service/supabaseService.ts";
import { createResource, createSignal, Show, For } from "solid-js";
import { ColumnDef } from "@tanstack/solid-table";
import { Shield, Users } from "lucide-solid";
import { DataTable } from "~/components/shared/table/DataTable.tsx";
import { TableSection } from "~/components/shared/table/TableSection.tsx";
import ConfirmTeamDelete from "./ConfirmDelete";
import { getTeamsWithMembers, TeamWithMembers } from "~/service/teamService";
import { TeamListContext } from "./TeamListContext";

const [showConfirm, setShowConfirm] = createSignal(false);
const [teamToDelete, setTeamToDelete] = createSignal<TeamWithMembers | null>(null);

const openDeleteConfirm = (team: TeamWithMembers) => {
  setTeamToDelete(team);
  setShowConfirm(true);
};

const getTeamInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const columns: ColumnDef<TeamWithMembers>[] = [
  {
    accessorKey: "name",
    header: "Team",
    cell: (info) => {
      const team = info.row.original;
      const memberCount = team.team_members?.length ?? 0;

      return (
        <div class="min-w-0 space-y-3">
          <div class="flex min-w-0 items-center gap-3">
            <div class="bg-secondary/12 text-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              {getTeamInitials(team.name)}
            </div>
            <div class="min-w-0">
              <p class="truncate font-semibold">{team.name}</p>
              <p class="text-base-content/65 text-sm">
                {memberCount} {memberCount === 1 ? "member" : "members"} ready for match setup.
              </p>
            </div>
          </div>

          <div class="space-y-2 sm:hidden">
            <Show
              when={team.team_members?.length}
              fallback={<span class="text-base-content/60 text-sm">No members assigned yet.</span>}
            >
              <div class="flex flex-wrap gap-1.5">
                <For each={team.team_members}>
                  {(member) => (
                    <span class="badge badge-outline badge-sm">
                      {member.players?.name ?? "Unknown"}
                    </span>
                  )}
                </For>
              </div>
            </Show>

            <div class="flex flex-wrap gap-2">
              <A class="btn btn-outline btn-xs min-w-20" href={`/teams/edit/${team.id}`}>
                Edit
              </A>
              <button
                class="btn btn-soft btn-error btn-xs min-w-20"
                onClick={() => openDeleteConfirm(team)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    header: "Members",
    meta: {
      headerClass: "hidden sm:table-cell",
      cellClass: "hidden sm:table-cell",
    },
    cell: (info) => {
      const team = info.row.original;
      const members = team.team_members ?? [];

      return (
        <Show
          when={members.length > 0}
          fallback={<span class="text-base-content/60 text-sm">No members assigned yet.</span>}
        >
          <div class="flex flex-wrap gap-1.5">
            <For each={members}>
              {(member) => (
                <span class="badge badge-outline badge-sm">
                  {member.players?.name ?? "Unknown"}
                </span>
              )}
            </For>
          </div>
        </Show>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    meta: {
      headerClass: "hidden text-right sm:table-cell",
      cellClass: "hidden w-0 text-right sm:table-cell",
    },
    cell: (info) => {
      const team = info.row.original;
      return (
        <div class="flex justify-end gap-2">
          <A class="btn btn-outline btn-sm min-w-20" href={`/teams/edit/${team.id}`}>
            Edit
          </A>
          <button
            class="btn btn-soft btn-error btn-sm min-w-20"
            onClick={() => openDeleteConfirm(team)}
          >
            Delete
          </button>
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
        <div class="px-4 py-4 sm:px-6">
          <Show
            when={data()}
            keyed
            fallback={
              <div class="flex h-full items-center justify-center">
                <span class="loading loading-spinner loading-xl" />
              </div>
            }
          >
            {(resolvedData) => (
              <TableSection
                eyebrow="Lineups"
                title="Teams"
                description="Keep custom pairings organized with a layout that can absorb future stats like record and goals scored without reworking the page."
                stats={
                  <>
                    <span class="badge badge-outline badge-sm gap-2 px-3 py-3">
                      <Shield class="h-3.5 w-3.5" />
                      {resolvedData.length} {resolvedData.length === 1 ? "team" : "teams"}
                    </span>
                    <span class="badge badge-outline badge-sm gap-2 px-3 py-3">
                      <Users class="h-3.5 w-3.5" />
                      {resolvedData.reduce(
                        (count, team) => count + (team.team_members?.length ?? 0),
                        0
                      )}{" "}
                      roster slots
                    </span>
                  </>
                }
                actions={
                  <A class="btn btn-primary btn-sm sm:btn-md min-w-40" href="/teams/new">
                    Create New Team
                  </A>
                }
              >
                <DataTable
                  columns={columns}
                  data={resolvedData}
                  emptyTitle="No teams yet"
                  emptyDescription="Create a team to group players for quick match setup."
                />
              </TableSection>
            )}
          </Show>
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

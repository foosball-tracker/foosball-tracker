import { Medal } from "lucide-solid";
import { LeaderboardContent } from "~/components/leaderboard/LeaderboardContent.tsx";

interface LeaderboardCardProps {
  refreshKey: number;
}

export function LeaderboardCard(props: Readonly<LeaderboardCardProps>) {
  return (
    <section class="card border-base-300 bg-base-100 text-base-content [html[data-theme=dim]_&]:bg-neutral [html[data-theme=dim]_&]:text-neutral-content h-full shadow-sm">
      <div class="card-body gap-4 p-4 sm:gap-5 sm:p-6">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="bg-base-200 text-base-content [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content rounded-full p-2">
              <Medal class="h-4 w-4" />
            </div>
            <div>
              <h3 class="text-lg font-black tracking-tight sm:text-xl">Leaderboard</h3>
              <p class="text-base-content/75 [html[data-theme=dim]_&]:text-neutral-content/75 text-sm">
                Wins from completed matches
              </p>
            </div>
          </div>

          <span class="badge badge-outline badge-sm px-3 py-3">Live</span>
        </div>
        <LeaderboardContent refreshKey={props.refreshKey} />
      </div>
    </section>
  );
}

import { Medal } from "lucide-solid";
import { LeaderboardContent } from "~/components/leaderboard/LeaderboardContent.tsx";

export default function LeaderboardPage() {
  return (
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <section class="space-y-3">
        <div class="flex items-center gap-3">
          <div class="bg-base-100 text-base-content [html[data-theme=dim]_&]:bg-base-100/10 [html[data-theme=dim]_&]:text-neutral-content rounded-full p-2 shadow-sm">
            <Medal class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <h1 class="text-2xl font-black tracking-tight sm:text-3xl">Leaderboard</h1>
            <p class="text-base-content/75 [html[data-theme=dim]_&]:text-neutral-content/75 text-sm sm:text-base">
              Wins from completed matches
            </p>
          </div>
        </div>
        <p class="text-base-content/75 [html[data-theme=dim]_&]:text-neutral-content/75 max-w-2xl text-sm leading-6 sm:text-base">
          Rankings are based on finished matches only. Switch between team and player views to scan
          the current standings.
        </p>
      </section>

      <section class="card border-base-300 bg-base-100 text-base-content [html[data-theme=dim]_&]:bg-neutral [html[data-theme=dim]_&]:text-neutral-content shadow-sm">
        <div class="card-body gap-4 p-4 sm:gap-5 sm:p-6">
          <LeaderboardContent />
        </div>
      </section>
    </div>
  );
}

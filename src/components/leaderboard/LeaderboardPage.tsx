import { LeaderboardContent } from "~/components/leaderboard/LeaderboardContent.tsx";
import { TableSection } from "~/components/shared/table/TableSection.tsx";

export default function LeaderboardPage() {
  return (
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <TableSection
        eyebrow="Standings"
        title="Leaderboard"
        description="Rankings are based on finished matches only. Switch between team and player views to scan the current standings."
        stats={
          <span class="badge badge-outline badge-sm px-3 py-3 whitespace-nowrap">Wins only</span>
        }
      >
        <LeaderboardContent />
      </TableSection>
    </div>
  );
}

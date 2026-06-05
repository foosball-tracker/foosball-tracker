import { LeaderboardContent } from "~/components/leaderboard/LeaderboardContent.tsx";
import { TableSection } from "~/components/shared/table/TableSection.tsx";

export default function LeaderboardPage() {
  return (
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <TableSection eyebrow="Standings" title="Leaderboard">
        <LeaderboardContent />
      </TableSection>
    </div>
  );
}

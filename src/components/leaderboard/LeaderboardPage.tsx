import { LeaderboardContent } from "~/components/leaderboard/LeaderboardContent.tsx";
import { TableSection } from "~/components/shared/table/TableSection.tsx";

export default function LeaderboardPage() {
  return (
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
      <TableSection title="Leaderboard">
        <LeaderboardContent />
      </TableSection>
    </div>
  );
}

import { GoalHistoryCard } from "~/components/home/GoalHistoryCard.tsx";
import { LeaderboardCard } from "~/components/home/LeaderboardCard.tsx";
import { ScoreBoard } from "~/components/ScoreBoard.tsx";
import type { ISettings } from "~/types/Settings";
import type { Tables } from "~/types/database";

type MatchRow = Tables<"matches">;
type GoalRow = Tables<"goals">;

interface MatchDashboardProps {
  currentMatch: MatchRow;
  elapsedTime: number;
  goals: GoalRow[];
  isPaused: boolean;
  leaderboardRefreshKey: number;
  onAdjustGoal: (teamId: number, increment: number) => Promise<void>;
  onResetGame: () => Promise<void>;
  onTogglePause: () => void;
  settings: ISettings;
}

export function MatchDashboard(props: Readonly<MatchDashboardProps>) {
  return (
    <div class="grid gap-6">
      <div class="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <ScoreBoard
          currentMatch={props.currentMatch}
          elapsedTime={props.elapsedTime}
          goals={props.goals}
          isPaused={props.isPaused}
          onAdjustGoal={props.onAdjustGoal}
          onResetGame={props.onResetGame}
          onTogglePause={props.onTogglePause}
          settings={props.settings}
        />
        <LeaderboardCard refreshKey={props.leaderboardRefreshKey} />
      </div>

      <GoalHistoryCard
        blackTeamId={props.settings.blackTeam.id}
        blackTeamName={props.settings.blackTeam.name}
        goals={props.goals}
        yellowTeamId={props.settings.yellowTeam.id}
        yellowTeamName={props.settings.yellowTeam.name}
      />
    </div>
  );
}

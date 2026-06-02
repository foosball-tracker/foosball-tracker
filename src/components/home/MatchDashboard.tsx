import { GoalHistoryCard } from "~/components/home/GoalHistoryCard.tsx";
import { LeaderboardCard } from "~/components/home/LeaderboardCard.tsx";
import { ScoreBoard } from "~/components/ScoreBoard.tsx";
import type { ISettings } from "~/types/Settings";
import type { Tables } from "~/types/database";

type MatchRow = Tables<"matches">;
type MatchEventRow = Tables<"match_events">;

interface MatchDashboardProps {
  backendReady: boolean;
  currentMatch: MatchRow;
  elapsedTime: number;
  matchEvents: MatchEventRow[];
  isPaused: boolean;
  isComplete: boolean;
  leaderboardRefreshKey: number;
  onAdjustGoal: (teamId: number, increment: number) => Promise<void>;
  onRematch: () => Promise<void>;
  onRematchSwitched: () => Promise<void>;
  onNewGame: () => void;
  onResetGame: () => Promise<void>;
  onTogglePause: () => void;
  settings: ISettings;
}

export function MatchDashboard(props: Readonly<MatchDashboardProps>) {
  return (
    <div class="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)] xl:items-start">
      <div class="grid gap-6">
        <ScoreBoard
          backendReady={props.backendReady}
          currentMatch={props.currentMatch}
          elapsedTime={props.elapsedTime}
          matchEvents={props.matchEvents}
          isPaused={props.isPaused}
          isComplete={props.isComplete}
          onAdjustGoal={props.onAdjustGoal}
          onRematch={props.onRematch}
          onRematchSwitched={props.onRematchSwitched}
          onNewGame={props.onNewGame}
          onResetGame={props.onResetGame}
          onTogglePause={props.onTogglePause}
          settings={props.settings}
        />
        <GoalHistoryCard
          blackTeamId={props.settings.blackTeam.id}
          blackTeamName={props.settings.blackTeam.name}
          events={props.matchEvents}
          yellowTeamId={props.settings.yellowTeam.id}
          yellowTeamName={props.settings.yellowTeam.name}
        />
      </div>

      <div class="grid gap-6">
        <LeaderboardCard refreshKey={props.leaderboardRefreshKey} />
      </div>
    </div>
  );
}

interface Team {
  id: number | undefined;
  name: string;
}

export interface ISettings {
  yellowTeam: Team;
  blackTeam: Team;
  goalsToWin: number;
}

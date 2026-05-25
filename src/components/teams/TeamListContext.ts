import { createContext, useContext } from "solid-js";

interface TeamListContextValue {
  refetchTeams: () => void;
}

export const TeamListContext = createContext<TeamListContextValue>();

export const useTeamListContext = () => useContext(TeamListContext);

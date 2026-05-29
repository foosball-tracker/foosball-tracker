import { createContext, useContext } from "solid-js";

interface PlayerListContextValue {
  refetchPlayers: () => void;
}

export const PlayerListContext = createContext<PlayerListContextValue>();

export const usePlayerListContext = () => useContext(PlayerListContext);

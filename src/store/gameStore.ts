import { createLocalStorageStore } from "../hooks/createLocalStorageStore";

export interface GoalEntry {
  team: "black" | "yellow";
  time: number; // seconds elapsed when the goal was scored
}

export interface GameState {
  timer: number;
  gameRunning: boolean;
  goalHistory: GoalEntry[];
}

export const [gameState, setGameState] = createLocalStorageStore<GameState>("gameState", {
  timer: 0,
  gameRunning: false,
  goalHistory: [],
});

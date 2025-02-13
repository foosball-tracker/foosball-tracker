import { ISettings } from "../types/Settings.ts";
import { onMount } from "solid-js";
import { mqttService } from "../service/mqttService.ts";
import { createLocalStorageSignal } from "../hooks/createLocalStorageSignal.tsx";
import { TeamScore } from "./TeamScore.tsx";
import { playGoalSound } from "../service/soundService.ts";
import { gameState, setGameState } from "../store/gameStore.ts";

interface ScoreBoardProps {
  settings: ISettings;
}

const topic = "goal";

export function ScoreBoard(props: ScoreBoardProps) {
  const [scoreBlack, setScoreBlack] = createLocalStorageSignal("score_black", 0);
  const [scoreYellow, setScoreYellow] = createLocalStorageSignal("score_yellow", 0);

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Record a goal entry only when the game is running.
  const recordGoal = (team: "black" | "yellow") => {
    if (gameState.gameRunning) {
      setGameState("goalHistory", (prev) => [...prev, { team, time: gameState.timer }]);
    }
  };

  // Centralized update function for both MQTT and manual updates.
  const updateScore = (team: "black" | "yellow", increment: number) => {
    if (increment > 0 && gameState.gameRunning) {
      recordGoal(team);
    } else if (increment < 0) {
      // Remove the last recorded goal of this team from the history
      setGameState("goalHistory", (prev) => {
        const lastIndex = prev.map((g) => g.team).lastIndexOf(team);
        if (lastIndex !== -1) {
          return prev.filter((_, i) => i !== lastIndex);
        }
        return prev;
      });
    }

    if (team === "black") {
      setScoreBlack((prev) => {
        const newScore = Math.max(0, prev + increment);
        if (newScore >= 10) setGameState("gameRunning", false);
        return newScore;
      });
    } else if (team === "yellow") {
      setScoreYellow((prev) => {
        const newScore = Math.max(0, prev + increment);
        if (newScore >= 10) setGameState("gameRunning", false);
        return newScore;
      });
    }
  };

  // Starts a new game.
  const startGame = () => {
    setScoreBlack(0);
    setScoreYellow(0);
    setGameState({ timer: 0, gameRunning: true, goalHistory: [] });
  };

  // Reset scores and game state.
  const resetScores = () => {
    setScoreBlack(0);
    setScoreYellow(0);
    setGameState({ timer: 0, gameRunning: false, goalHistory: [] });
  };

  // MQTT subscription & timer interval.
  onMount(() => {
    mqttService.subscribe(topic);

    const handleMessage = (msg: string) => {
      try {
        const data = JSON.parse(msg); // expect { team: "black"|"yellow", value: number }
        if (data.team === "black") {
          setScoreBlack((prev) => {
            const newScore = prev + data.value;
            if (data.value > 0 && gameState.gameRunning) recordGoal("black");
            if (newScore >= 10) setGameState("gameRunning", false);
            return newScore;
          });
          playGoalSound();
        } else if (data.team === "yellow") {
          setScoreYellow((prev) => {
            const newScore = prev + data.value;
            if (data.value > 0 && gameState.gameRunning) recordGoal("yellow");
            if (newScore >= 10) setGameState("gameRunning", false);
            return newScore;
          });
          playGoalSound();
        }
      } catch (error) {
        console.error("Failed to parse MQTT message:", msg, error);
      }
    };

    mqttService.on(topic, handleMessage);

    const timerInterval = setInterval(() => {
      if (gameState.gameRunning) {
        setGameState("timer", (t) => t + 1);
      }
    }, 1000);

    return () => {
      mqttService.off(topic, handleMessage);
      mqttService.unsubscribe(topic);
      clearInterval(timerInterval);
    };
  });

  return (
    <div class="card card-border bg-base-300 max-w-3xl">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="card-title text-2xl">Score</h2>
          </div>
          <div class="flex gap-2">
            {!gameState.gameRunning && (
              <button class="btn btn-sm btn-primary" onClick={startGame}>
                Start Game
              </button>
            )}
            <button class="btn btn-sm btn-error" onClick={resetScores}>
              Reset Game
            </button>
          </div>
        </div>

        <div class="flex-col">
          <div class="flex justify-center">
            <span class="text-center text-xl">Time: {formatTime(gameState.timer)}</span>
          </div>

          <div class="mt-4 flex w-full items-center gap-8">
            <div class="flex-1 text-right">
              <TeamScore
                team="black"
                teamName={props.settings.blackTeam}
                score={scoreBlack()}
                updateScore={(inc) => updateScore("black", inc)}
              />
            </div>
            <div class="text-3xl font-bold">:</div>
            <div class="flex-1 text-left">
              <TeamScore
                team="yellow"
                teamName={props.settings.yellowTeam}
                score={scoreYellow()}
                updateScore={(inc) => updateScore("yellow", inc)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

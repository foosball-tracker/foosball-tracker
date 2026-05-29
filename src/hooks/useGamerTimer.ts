import { createEffect, createSignal, onCleanup } from "solid-js";

export function useGameTimer() {
  const [elapsedTime, setElapsedTime] = createSignal(0);
  const [running, setRunning] = createSignal(false);

  let startTimestamp: number | null = null;
  let intervalId: number | null = null;

  createEffect(() => {
    // If timer is running, set up the interval
    if (running()) {
      // If we've never started before, set the start now
      if (startTimestamp === null) {
        startTimestamp = Date.now();
      } else {
        // If we had previously been running, “resume” while keeping the offset
        startTimestamp = Date.now() - elapsedTime() * 1000;
      }

      intervalId = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - (startTimestamp ?? 0)) / 1000));
      }, 1000) as unknown as number;

      // Clean up interval if we ever stop or unmount
      onCleanup(() => {
        if (intervalId) clearInterval(intervalId);
      });
    } else if (intervalId) {
      // Timer not running but interval is still active
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  const start = () => {
    if (!running()) setRunning(true);
  };

  const stop = () => {
    setRunning(false);
  };

  const reset = () => {
    // Reset everything
    setRunning(false);
    setElapsedTime(0);
    startTimestamp = null;
  };

  return {
    elapsedTime, // signal for your UI
    start,
    stop,
    reset,
    running, // just in case you want to show "pause" vs. "start" etc.
  };
}

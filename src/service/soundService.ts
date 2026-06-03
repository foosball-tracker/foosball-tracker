import { createSignal } from "solid-js";

export type SoundType = "goal" | "no-goal" | "win";

const MUTE_STORAGE_KEY = "foosball-muted";

function loadMuteState(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

const [isMuted, setIsMuted] = createSignal(loadMuteState());

export { isMuted };

export function toggleMute() {
  const next = !isMuted();
  setIsMuted(next);
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, String(next));
  } catch {
    // localStorage may be unavailable in some environments
  }
}

class SoundService {
  // Keep track of the last 5 picks per sound type (not needed for "win").
  private readonly recentPicks: Record<"goal" | "no-goal", number[]> = {
    goal: [],
    "no-goal": [],
  };

  // Total number of sounds available for each type.
  private readonly totals: Record<SoundType, number>;

  constructor(totals: Record<SoundType, number>) {
    this.totals = totals;
  }

  getSoundPath(type: SoundType): string {
    if (type === "win") {
      // Always play the first "win" sound (or random if multiple exist)
      return `/audio/win/win-1.mp3`;
    }

    const total = this.totals[type];

    // Build list of indices not in the recent picks.
    let available: number[] = [];
    for (let i = 0; i < total; i++) {
      if (!this.recentPicks[type].includes(i)) {
        available.push(i);
      }
    }

    // If all indices have been used recently, allow all.
    if (available.length === 0) {
      available = Array.from({ length: total }, (_, i) => i);
    }

    // Choose a random index from available ones using a CSPRNG.
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const chosenIndex = available[array[0] % available.length];

    // Update recent picks (max last 5).
    this.recentPicks[type].push(chosenIndex);
    if (this.recentPicks[type].length > 5) {
      this.recentPicks[type].shift();
    }

    return `/audio/${type}/${type}-${chosenIndex}.mp3`;
  }
}

// Create a default instance.
const soundService = new SoundService({
  goal: 22,
  "no-goal": 13,
  win: 1, // Set to the number of available "win" sounds
});

export default soundService;

export function playSound(type: SoundType) {
  if (isMuted()) return;
  const soundUrl = soundService.getSoundPath(type);
  console.log("playing sound url", soundUrl);
  const audio = new Audio(soundUrl);
  audio.play().then(() => console.log("Audio played:", soundUrl));
}

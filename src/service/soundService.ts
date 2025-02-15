export type SoundType = "goal" | "no-goal" | "win";

class SoundService {
  // Keep track of the last 5 picks per sound type (not needed for "win").
  private recentPicks: Record<"goal" | "no-goal", number[]> = {
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

    // Choose a random index from available ones.
    const chosenIndex = available[Math.floor(Math.random() * available.length)];

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
  const soundUrl = soundService.getSoundPath(type);
  console.log("playing sound url", soundUrl);
  const audio = new Audio(soundUrl);
  audio.play().then(() => console.log("Audio played:", soundUrl));
}

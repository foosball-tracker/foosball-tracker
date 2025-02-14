// soundService.ts

export type SoundType = "goal" | "no-goal";

class SoundService {
  // Keep track of the last 5 picks per sound type.
  private recentPicks: Record<SoundType, number[]> = {
    goal: [],
    "no-goal": [],
  };

  // Total number of sounds available for each type.
  // For example, if you have goal-0.mp3 to goal-19.mp3, total for "goal" is 20.
  private readonly totals: Record<SoundType, number>;

  constructor(totals: Record<SoundType, number>) {
    this.totals = totals;
  }

  getRandomSoundPath(type: SoundType): string {
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

    // Build the URL path relative to the public folder.
    // E.g., /audio/goal/goal-0.mp3 or /audio/no-goal/no-goal-0.mp3.
    return `/audio/${type}/${type}-${chosenIndex}.mp3`;
  }
}

// Create a default instance.
// Adjust the totals if you add more sounds.
const soundService = new SoundService({
  goal: 22,
  "no-goal": 13,
});

export default soundService;

export function playSound(type: SoundType) {
  const soundUrl = soundService.getRandomSoundPath(type);
  console.log("playing sound url", soundUrl);
  const audio = new Audio(soundUrl);
  audio.play().then((r) => console.log("audio", r));
}

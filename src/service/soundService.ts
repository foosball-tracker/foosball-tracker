import goalSound from "../assets/ronaldo-siuuuu.mp3";

const audio = new Audio(goalSound);

export function playGoalSound() {
  audio.currentTime = 0;
  audio.play().catch((error) => {
    console.error("Error playing sound:", error);
  });
}

import { useGame } from "../contexts/GameContext";
import { DigitDisplay } from "./DigitDisplay";

export function GameStatus() {
  const { mineCount, flagCount, elapsedTime } = useGame();
  const minesRemaining = mineCount - flagCount;
  return (
    <div className="game-status">
      <DigitDisplay value={minesRemaining} />
      <DigitDisplay value={elapsedTime} />
    </div>
  );
}

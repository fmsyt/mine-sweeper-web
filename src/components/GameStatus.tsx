import { useGame } from "./game/GameContext";
import { DigitDisplay } from "./DigitDisplay";

export function GameStatus() {
  const { mineCount, flagCount, elapsedTime, resetGame } = useGame();
  const minesRemaining = mineCount - flagCount;
  return (
    <>
      <DigitDisplay value={minesRemaining} />
      <button
        type="button"
        className="btn btn-xs btn-circle text-2xl"
        onClick={resetGame}
        title="Reset Game"
      >
        😌
      </button>
      <DigitDisplay value={elapsedTime} />
    </>
  );
}

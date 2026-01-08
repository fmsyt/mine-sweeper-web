import { useGame } from "./game/GameContext";
import { DigitDisplay } from "./DigitDisplay";
import { useMemo } from "react";

export type GameStatusProps = {
  digitCount?: number;
};

export function GameStatus(props: GameStatusProps) {
  const { digitCount = 3 } = props;

  const { mineCount, flagCount, elapsedTime, resetGame } = useGame();
  const minesRemaining = mineCount - flagCount;

  const maxElapsedTime = useMemo(() => 10 ** digitCount - 1, [digitCount]);

  return (
    <>
      <DigitDisplay value={minesRemaining} digitCount={digitCount} />
      <button
        type="button"
        className="btn btn-xs btn-circle text-2xl"
        onClick={resetGame}
        title="Reset Game"
      >
        😌
      </button>
      <DigitDisplay
        value={Math.min(elapsedTime, maxElapsedTime)}
        digitCount={digitCount}
      />
    </>
  );
}

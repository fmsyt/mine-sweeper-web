import { GameProvider, useGame } from "./game/GameContext";
import { GameBoard } from "./GameBoard";

function DemoInner() {
  const { resetGame } = useGame();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <GameBoard />

      <button
        type="button"
        className="btn btn-sm btn-primary"
        onClick={() => {
          resetGame();
        }}
      >
        reset
      </button>
    </div>
  );
}

export default function Demo() {
  return (
    <GameProvider
      gameConfig={{
        rows: 5,
        cols: 5,
        mines: 5,
        showFlagAnimation: true,
      }}
    >
      <DemoInner />
    </GameProvider>
  );
}

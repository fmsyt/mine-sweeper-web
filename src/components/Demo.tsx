import { GameProvider, useGame } from "./game/GameContext";
import type { GameConfig } from "./game/types";
import { GameBoard } from "./GameBoard";
import { GameStatus } from "./GameStatus";

function DemoInner() {
  const { resetGame } = useGame();

  return (
    <div className="flex flex-col w-fit items-center justify-center gap-2">
      <div className="flex flex-row items-center justify-between w-full">
        <GameStatus digitCount={2} />
      </div>
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

type DemoProps = {
  gameConfig?: GameConfig;
};

const defaultConfig: GameConfig = {
  rows: 5,
  cols: 5,
  mines: 5,
  showFlagAnimation: true,
};

export default function Demo(props: DemoProps) {
  return (
    <GameProvider
      gameConfig={{
        ...defaultConfig,
        ...props.gameConfig,
      }}
    >
      <DemoInner />
    </GameProvider>
  );
}

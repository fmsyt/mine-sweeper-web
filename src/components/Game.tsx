import { GameProvider, useGame } from "../contexts/GameContext";
import "../styles/game.css";
import { DifficultySettings } from "./DifficultySettings";
import { GameBoard } from "./GameBoard";
import { GameStatus } from "./GameStatus";

function GameInner() {
  const { board, gameOver, gameWon } = useGame();

  return (
    <div className="flex flex-col align-center items-center gap-4">
      {!board && (
        <>
          <DifficultySettings />
          <GameBoard />
        </>
      )}

      {board && (
        <div className="flex flex-col gap-4 items-stretch w-fit select-none touch-none">
          <GameStatus />

          <GameBoard />

          {gameOver && <div className="w-full text-center">Game Over! 💥</div>}
          {gameWon && <div className="w-full text-center">You Win! 🎉</div>}
        </div>
      )}
    </div>
  );
}

function Game() {
  return (
    <GameProvider>
      <GameInner />
    </GameProvider>
  );
}

export default Game;

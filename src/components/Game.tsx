import { GameProvider, useGame } from "../contexts/GameContext";
import "../styles/game.css";
import { DifficultySettings } from "./DifficultySettings";
import { GameBoard } from "./GameBoard";
import { GameStatus } from "./GameStatus";

function GameInner() {
  const { board, gameOver, gameWon, resetGame } = useGame();

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

          {gameOver && <div className="status">Game Over! 💥</div>}
          {gameWon && <div className="status">You Win! 🎉</div>}

          <div className="mx-auto">
            <button type="button" onClick={resetGame} className="btn">
              New Game
            </button>
          </div>
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

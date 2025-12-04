import { GameProvider, useGame } from "../contexts/GameContext";
import "../styles/game.css";
import { DifficultySettings } from "./DifficultySettings";
import { GameBoard } from "./GameBoard";
import { GameStatus } from "./GameStatus";

function GameInner() {
  const { board, gameOver, gameWon, resetGame } = useGame();

  return (
    <div>
      {!board && (
        <>
          <DifficultySettings />

          <div className="game-area">
            <GameBoard />
          </div>
        </>
      )}

      {board && (
        <div className="game-area">
          <GameStatus />

          <GameBoard />

          {gameOver && <div className="status">Game Over! 💥</div>}
          {gameWon && <div className="status">You Win! 🎉</div>}

          <button type="button" onClick={resetGame} className="btn">
            New Game
          </button>
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

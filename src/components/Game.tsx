import { GameProvider, useGame } from "../contexts/GameContext";
import { LocalStorageProvider } from "../contexts/LocalStorageContext";
import { DifficultySettings } from "./DifficultySettings";
import "./game.css";
import { GameBoard } from "./GameBoard";
import { GameStatus } from "./GameStatus";

function GameInner() {
  const { board, gameOver, gameWon, resetGame } = useGame();

  return (
    <main className="container">
      <h1>Minesweeper</h1>

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

          <button type="button" onClick={resetGame} className="reset-btn">
            New Game
          </button>
        </div>
      )}
    </main>
  );
}

function Game() {
  return (
    <LocalStorageProvider>
      <GameProvider>
        <GameInner />
      </GameProvider>
    </LocalStorageProvider>
  );
}

export default Game;

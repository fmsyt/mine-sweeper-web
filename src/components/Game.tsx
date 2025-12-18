import { useEffect, useRef } from "react";
import "../styles/game.css";
import { DifficultySettings } from "./DifficultySettings";
import { GameBoard } from "./GameBoard";
import { GameStatus } from "./GameStatus";
import { GameProvider, useGame } from "./game/GameContext";

function GameInner() {
  const { gameOver, gameWon } = useGame();

  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      dialogRef.current?.showModal();
    }, 20);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col align-center items-center justify-center gap-4 h-svh">
      <div className="grid grid-cols-3 flex-col gap-4 items-center justify-items-center w-fit select-none touch-none">
        <GameStatus />

        <div className="col-span-3 outline outline-2 outline-gray-400">
          <GameBoard />
        </div>

        {gameOver && (
          <div className="w-full text-center col-span-3">Game Over! 💥</div>
        )}
        {gameWon && (
          <div className="w-full text-center col-span-3">You Win! 🎉</div>
        )}
      </div>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <DifficultySettings />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>

      {true && (
        <div className="fab">
          <button
            type="button"
            className="btn btn-lg btn-circle btn-info"
            onClick={() => {
              dialogRef.current?.showModal();
            }}
          >
            <span className="material-symbols-outlined">settings</span>
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

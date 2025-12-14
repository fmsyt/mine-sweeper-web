import { useRef } from "react";
import { GameProvider, useGame } from "../contexts/GameContext";
import "../styles/game.css";
import { DifficultySettings } from "./DifficultySettings";
import { GameBoard } from "./GameBoard";
import { GameStatus } from "./GameStatus";

function GameInner() {
  const {
    board,
    gameOver,
    gameWon,
    showFlagAnimation,
    toggleFlagAnimation,
    holdToFlagDurationMs,
    setHoldToFlagDurationMs,
  } = useGame();

  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="flex flex-col align-center items-center justify-center gap-4 h-svh">
      {!board && <DifficultySettings />}

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
          <div className="font-bold text-lg">プレイ設定</div>
          <div className="py-4 flex flex-col gap-4">
            <label className="label">
              <input
                type="checkbox"
                className="toggle"
                checked={showFlagAnimation}
                onChange={toggleFlagAnimation}
              />
              アニメーション
            </label>
            <label className="label flex flex-col items-start gap-2">
              <div>長押し時間: {holdToFlagDurationMs}ms</div>
              <input
                type="range"
                className="slider w-full"
                value={holdToFlagDurationMs}
                onChange={(e) =>
                  setHoldToFlagDurationMs(Number(e.target.value))
                }
                min="100"
                max="1000"
                step="50"
              />
            </label>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>

      {false && (
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

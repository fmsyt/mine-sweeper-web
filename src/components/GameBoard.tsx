/** biome-ignore-all lint/suspicious/noArrayIndexKey: cellKey */
import { useRef } from "react";
import closedImg from "../assets/game/closed.svg";
import flagImg from "../assets/game/flag.svg";
import mineImg from "../assets/game/mine.svg";
import mineRedImg from "../assets/game/mine_red.svg";
import mineWrongImg from "../assets/game/mine_wrong.svg";
import type0Img from "../assets/game/type0.svg";
import type1Img from "../assets/game/type1.svg";
import type2Img from "../assets/game/type2.svg";
import type3Img from "../assets/game/type3.svg";
import type4Img from "../assets/game/type4.svg";
import type5Img from "../assets/game/type5.svg";
import type6Img from "../assets/game/type6.svg";
import type7Img from "../assets/game/type7.svg";
import type8Img from "../assets/game/type8.svg";
import type { Cell } from "../componentstypes";
import { useGame } from "../contexts/GameContext";

const typeImages = [
  type0Img,
  type1Img,
  type2Img,
  type3Img,
  type4Img,
  type5Img,
  type6Img,
  type7Img,
  type8Img,
];

const getCellImage = (
  cell: Cell,
  r: number,
  c: number,
  board: Cell[][] | null,
  gameOver: boolean,
  rows: number,
) => {
  if (cell.state === "flagged") {
    if (gameOver && !cell.isMine) {
      return mineWrongImg;
    }
    return flagImg;
  }
  if (cell.state === "closed") return closedImg;
  if (cell.isMine) {
    if (gameOver && board) {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < board[i].length; j++) {
          if (
            board[i][j].state === "opened" &&
            board[i][j].isMine &&
            i === r &&
            j === c
          ) {
            return mineRedImg;
          }
        }
      }
    }
    return mineImg;
  }
  return typeImages[cell.adjacentMines];
};

export function GameBoard() {
  const {
    board,
    rows,
    cols,
    gameOver,
    holdToFlagDurationMs,
    animatingFlags,
    handleCellClick,
    handleCellRightClick,
  } = useGame();
  const mouseDownTime = useRef<number | null>(null);
  const mouseDownCell = useRef<{ r: number; c: number } | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const longPressTriggered = useRef<boolean>(false);

  const lastMouseButtonRef = useRef<number | null>(null);

  const handlePointerDown = (r: number, c: number) => {
    mouseDownTime.current = Date.now();
    mouseDownCell.current = { r, c };
    longPressTriggered.current = false;

    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      handleCellRightClick(r, c);
    }, holdToFlagDurationMs);
  };

  const handlePointerUp = (r: number, c: number) => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (
      !longPressTriggered.current &&
      mouseDownTime.current !== null &&
      mouseDownCell.current?.r === r &&
      mouseDownCell.current?.c === c
    ) {
      handleCellClick(r, c);
    }

    mouseDownTime.current = null;
    mouseDownCell.current = null;
    longPressTriggered.current = false;
  };
  const handleMouseUp = (r: number, c: number) => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
    }

    handleCellRightClick(r, c);

    longPressTriggered.current = false;
    mouseDownTime.current = null;
    mouseDownCell.current = null;
  };

  return (
    <div className="board-wrapper">
      {!board && (
        <div
          className="board initial-board"
          style={{
            gridTemplateColumns: `repeat(${cols}, 32px)`,
            gridTemplateRows: `repeat(${rows}, 32px)`,
          }}
        >
          {Array(rows)
            .fill(null)
            .map((_, r) =>
              Array(cols)
                .fill(null)
                .map((_, c) => (
                  <button
                    type="button"
                    key={`${r}-${c}`}
                    className="cell initial-cell"
                    onMouseDown={() => handlePointerDown(r, c)}
                    onMouseUp={() => handlePointerUp(r, c)}
                  >
                    <img src={closedImg.src} alt="cell" />
                  </button>
                )),
            )}
        </div>
      )}

      {!!board && (
        <div
          className="board"
          style={{
            gridTemplateColumns: `repeat(${cols}, 32px)`,
            gridTemplateRows: `repeat(${rows}, 32px)`,
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const cellKey = `${r}-${c}`;
              const isAnimating = animatingFlags.has(cellKey);
              return (
                <button
                  type="button"
                  key={cellKey}
                  className="cell"
                  onMouseDown={(e) => {
                    lastMouseButtonRef.current = e.button;
                    handlePointerDown(r, c);
                  }}
                  onMouseUp={(_e) => {
                    if (lastMouseButtonRef.current === null) {
                      return;
                    }

                    const button = lastMouseButtonRef.current;
                    lastMouseButtonRef.current = null;

                    switch (button) {
                      case 0: // 左クリック
                        handlePointerUp(r, c);
                        break;

                      case 2: // 右クリック
                        handleMouseUp(r, c);
                        break;
                    }
                  }}
                  onPointerDown={(e) => {
                    if (e.pointerType === "mouse") {
                      // onMouseDownで処理しているので無視
                      return;
                    }
                    e.preventDefault();
                    handlePointerDown(r, c);
                  }}
                  onPointerUp={(e) => {
                    if (e.pointerType === "mouse") {
                      // onMouseUpで処理しているので無視
                      return;
                    }
                    e.preventDefault();
                    handlePointerUp(r, c);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                  }}
                >
                  <img
                    src={getCellImage(cell, r, c, board, gameOver, rows).src}
                    alt="cell"
                    className={
                      isAnimating && cell.state === "flagged" ? "flag-drop" : ""
                    }
                  />
                </button>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}

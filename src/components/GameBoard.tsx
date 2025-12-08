/** biome-ignore-all lint/suspicious/noArrayIndexKey: cellKey */
import { useRef } from "react";
import type { Cell } from "../componentstypes";
import { useGame } from "../contexts/GameContext";

const getCellClass = (
  cell: Cell,
  r: number,
  c: number,
  board: Cell[][] | null,
  gameOver: boolean,
  rows: number,
) => {
  if (cell.state === "flagged") {
    if (gameOver && !cell.isMine) {
      return "cell-mine-wrong";
    }
    return "cell-flag";
  }
  if (cell.state === "closed") return "cell-closed";
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
            return "cell-mine-red";
          }
        }
      }
    }
    return "cell-mine";
  }
  return `cell-type${cell.adjacentMines}`;
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

  const lockHandle = useRef<boolean>(false);
  const lastMouseButtonRef = useRef<number | null>(null);

  const handlePointerDown = (r: number, c: number) => {
    mouseDownTime.current = Date.now();
    mouseDownCell.current = { r, c };
    longPressTriggered.current = false;

    longPressTimer.current = window.setTimeout(() => {
      if (lockHandle.current) {
        return;
      }

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
    <div
      className="board-wrapper"
      onScroll={(_e) => {
        // スクロール時にロック
        lockHandle.current = true;
      }}
    >
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
                    className="cell initial-cell cell-closed"
                    onMouseDown={() => handlePointerDown(r, c)}
                    onMouseUp={() => handlePointerUp(r, c)}
                  />
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

              const classNames = [
                "cell",
                getCellClass(cell, r, c, board, gameOver, rows),
                ...(isAnimating && cell.state === "flagged"
                  ? ["flag-drop"]
                  : []),
              ];

              return (
                <button
                  type="button"
                  key={cellKey}
                  className={classNames.join(" ")}
                  onPointerDown={(e) => {
                    if (e.pointerType === "mouse") {
                      // onMouseDownで処理するので無視
                      return;
                    }
                    e.preventDefault();
                    handlePointerDown(r, c);
                  }}
                  onPointerUp={(e) => {
                    if (e.pointerType === "mouse") {
                      // onMouseUpで処理するのでので無視
                      return;
                    }
                    e.preventDefault();
                    handlePointerUp(r, c);
                  }}
                  onMouseDown={(e) => {
                    lastMouseButtonRef.current = e.button;
                    handlePointerDown(r, c);
                  }}
                  onMouseUp={(_e) => {
                    if (lastMouseButtonRef.current === null) {
                      return;
                    }

                    // 最後に押されたボタンに応じて処理を分岐
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
                  onContextMenu={(e) => {
                    // コンテキストメニューを表示しない
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    // 複数指でのタッチはロック
                    if (e.touches.length > 1) {
                      lockHandle.current = true;
                    }
                  }}
                  onTouchMove={(_e) => {
                    // スクロールなどで指が動いたらロック
                    lockHandle.current = true;
                  }}
                  onTouchEnd={(e) => {
                    // 全ての指が離れたらロック解除
                    if (e.touches.length === 0) {
                      lockHandle.current = false;
                    }
                  }}
                />
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}

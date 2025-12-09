/** biome-ignore-all lint/suspicious/noArrayIndexKey: cellKey */
import { useCallback, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import type { Cell } from "../componentstypes";
import { useGame } from "../contexts/GameContext";

const showDebugLogs = true;
const showDebugOnConsole = false;

function getCellClass(
  cell: Cell,
  r: number,
  c: number,
  board: Cell[][] | null,
  gameOver: boolean,
  rows: number,
) {
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
}

type LogEntry = {
  message: string;
  className?: string;
  duplicateCount?: number;
};

function useLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((log: LogEntry) => {
    if (showDebugOnConsole) {
      console.debug(log.message);
    }

    if (!showDebugLogs) {
      return;
    }

    setLogs((prevLogs) => {
      const lastLog = prevLogs[prevLogs.length - 1] || null;

      if (lastLog?.message === log.message) {
        const count = lastLog?.duplicateCount || 0;
        lastLog.duplicateCount = count + 1;

        return [...prevLogs.slice(0, -1), lastLog];
      }

      const next = [...prevLogs, log];
      return next;
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    addLog,
    clearLogs,
  };
}

/**
 * ```
 * pointerDown -> mouseDown  -> [mouseMove] -> pointerUp -> mouseUp
 *             -> touchStart -> [touchMove] -> pointerUp -> touchEnd
 * ```
 */
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

  const { logs, addLog, clearLogs } = useLogger();

  const mouseDownTime = useRef<number | null>(null);
  const mouseDownCell = useRef<{ r: number; c: number } | null>(null);
  const longPressTimerHandler = useRef<number | null>(null);

  const _lockHandle = useRef<boolean>(false);
  const lastMouseButtonRef = useRef<number | null>(null);

  const setLockState = useCallback(
    (toLock: boolean, debugMessage?: string) => {
      _lockHandle.current = toLock;
      if (toLock && longPressTimerHandler.current !== null) {
        clearTimeout(longPressTimerHandler.current);
        longPressTimerHandler.current = null;
      }

      if (debugMessage) {
        addLog({ message: `🔒Set lock state to ${toLock} ${debugMessage}` });
      }
    },
    [addLog],
  );

  const startTimer = useCallback(
    (r: number, c: number) => {
      mouseDownTime.current = Date.now();
      mouseDownCell.current = { r, c };

      if (longPressTimerHandler.current !== null) {
        addLog({ message: `⌛Clear existing long press timer` });
        clearTimeout(longPressTimerHandler.current);
      }

      addLog({ message: `⌛Start long press timer for cell (${r}, ${c})` });

      longPressTimerHandler.current = window.setTimeout(() => {
        addLog({ message: `Long press detected on cell (${r}, ${c})` });
        handleCellRightClick(r, c);
      }, holdToFlagDurationMs);
    },
    [handleCellRightClick, holdToFlagDurationMs, addLog],
  );

  const clearTimer = useCallback(() => {
    if (longPressTimerHandler.current !== null) {
      clearTimeout(longPressTimerHandler.current);
    }

    longPressTimerHandler.current = null;
  }, []);

  const handlePointerDown = useCallback(
    (r: number, c: number) => {
      startTimer(r, c);
      addLog({ message: `⌚Start timer on cell (${r}, ${c})` });
    },
    [startTimer, addLog],
  );

  const handleCellOpen = useCallback(
    (r: number, c: number, forceOpen?: boolean) => {
      clearTimer();

      if (
        forceOpen ||
        (!_lockHandle.current &&
          mouseDownTime.current !== null &&
          mouseDownCell.current?.r === r &&
          mouseDownCell.current?.c === c)
      ) {
        addLog({ message: `💣Cell open on cell (${r}, ${c})` });
        handleCellClick(r, c);
      }

      mouseDownTime.current = null;
      mouseDownCell.current = null;
    },
    [handleCellClick, clearTimer, addLog],
  );

  const handleSetFlag = useCallback(
    (r: number, c: number) => {
      clearTimer();

      addLog({ message: `🚩Set flag on cell (${r}, ${c})` });
      handleCellRightClick(r, c);

      mouseDownTime.current = null;
      mouseDownCell.current = null;
    },
    [handleCellRightClick, clearTimer, addLog],
  );

  return (
    <div className="board-wrapper">
      <TransformWrapper
        smooth={false}
        centerOnInit={true}
        doubleClick={{ disabled: true }}
        minScale={0.1}
        maxScale={4}
        initialScale={1}
        panning={{ velocityDisabled: true, allowRightClickPan: false }}
        onPanningStart={(_ref, e) => {
          addLog({ message: `${e.type}: onPanningStart` });
          // setLockState(true, "onPanningStart");
        }}
        onPanning={(_ref, e) => {
          addLog({ message: `${e.type}: onPanning` });
          setLockState(true, "onPanning");
        }}
        onPinchingStart={(_ref, e) => {
          addLog({ message: `${e.type}: onPinchingStart` });
          setLockState(true, "onPinchingStart");
        }}
        onZoomStart={(_ref, e) => {
          addLog({ message: `${e.type}: onZoomStart` });
          setLockState(true, "onZoomStart");
        }}
        onWheelStart={(_ref, e) => {
          addLog({ message: `${e.type}: onWheelStart` });
          setLockState(true, "onWheelStart");
        }}
      >
        <TransformComponent
          wrapperStyle={{
            maxWidth: "100%",
            maxHeight: "max(100%,50vh)",
          }}
        >
          <div
            className="board"
            style={{
              gridTemplateColumns: `repeat(${cols}, 32px)`,
              gridTemplateRows: `repeat(${rows}, 32px)`,
            }}
          >
            {!board &&
              Array(rows)
                .fill(null)
                .map((_, r) =>
                  Array(cols)
                    .fill(null)
                    .map((_, c) => (
                      <button
                        type="button"
                        key={`init-${r}-${c}`}
                        className="cell initial-cell cell-closed"
                        onMouseUp={() => handleCellOpen(r, c, true)}
                      />
                    )),
                )}

            {!!board &&
              board.map((row, r) =>
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
                        addLog({
                          message: `${e.type}: pointerType: ${e.pointerType}`,
                        });
                        if (e.pointerType === "mouse") {
                          // onMouseDownで処理するので無視
                          return;
                        }
                        e.preventDefault();

                        handlePointerDown(r, c);
                        if (!_lockHandle.current) {
                          // handlePointerDown(r, c);
                        }
                      }}
                      onPointerUp={(e) => {
                        addLog({ message: e.type });
                        if (e.pointerType === "mouse") {
                          // onMouseUpで処理するのでので無視
                          return;
                        }
                        e.preventDefault();
                        handleCellOpen(r, c);
                      }}
                      onMouseDown={(e) => {
                        addLog({ message: e.type });
                        lastMouseButtonRef.current = e.button;
                        handlePointerDown(r, c);
                      }}
                      onMouseUp={(e) => {
                        addLog({ message: e.type });

                        if (lastMouseButtonRef.current === null) {
                          return;
                        }

                        if (_lockHandle.current) {
                          setLockState(false, "onMouseUp locked");
                          return;
                        }

                        // 最後に押されたボタンに応じて処理を分岐
                        const button = lastMouseButtonRef.current;
                        lastMouseButtonRef.current = null;

                        switch (button) {
                          case 0: // 左クリック
                            handleCellOpen(r, c);
                            break;

                          case 2: // 右クリック
                            handleSetFlag(r, c);
                            break;
                        }
                      }}
                      onContextMenu={(e) => {
                        addLog({ message: e.type });
                        // コンテキストメニューを表示しない
                        e.preventDefault();
                      }}
                      onTouchStart={(e) => {
                        addLog({
                          message: `${e.type}: touches: ${e.touches.length}`,
                        });
                        // 複数指でのタッチはロック
                        if (e.touches.length > 1) {
                          setLockState(true, "onTouchStart multiple touches");
                          clearTimer();
                        }
                      }}
                      onTouchMove={(e) => {
                        addLog({ message: e.type });
                        // スクロールなどで指が動いたらロック
                        setLockState(true, "onTouchMove");
                      }}
                      onTouchEnd={(e) => {
                        addLog({
                          message: `${e.type}: touches: ${e.touches.length}`,
                        });
                        // 全ての指が離れたらロック解除
                        if (e.touches.length === 0) {
                          setLockState(false, "onTouchEnd");
                        }
                      }}
                    />
                  );
                }),
              )}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {showDebugLogs && (
        <div className="flex flex-col items-center mt-4 p-2 border border-gray-300 rounded w-full">
          <button
            type="button"
            className="btn btn-sm btn-secondary mb-2"
            onClick={clearLogs}
          >
            ログをクリア
          </button>
          <div className="event-log mt-4 max-h-32 overflow-auto w-full">
            {[...logs].reverse().map((log, index) => (
              <div key={index} className="text-xs font-mono">
                {`${logs.length - index}: ${log.message}`}
                {log.duplicateCount && log.duplicateCount > 0 && (
                  <span className="text-gray-500">
                    {` (x${log.duplicateCount + 1})`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

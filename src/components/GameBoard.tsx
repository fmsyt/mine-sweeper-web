/** biome-ignore-all lint/suspicious/noArrayIndexKey: cellKey */
import { useCallback, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import type { Cell } from "../componentstypes";
import { useGame } from "../contexts/GameContext";

const showDebugLogs = import.meta.env.DEV && true;
const showDebugOnConsole = import.meta.env.DEV && false;

type CellOpenPromise = Promise<void>;
type ChangeCellStateCallback = () => void;

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

  const controllerRef = useRef<{
    abort: () => void;
    getState: () => "pending" | "resolved" | "rejected";
  } | null>(null);

  const makeLongPressPromise = useCallback(
    (r: number, c: number) => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const controller = new AbortController();

      let state: "pending" | "resolved" | "rejected" = "pending";

      const promise: CellOpenPromise = new Promise((resolve, reject) => {
        const timerId = window.setTimeout(() => {
          state = "resolved";
          addLog({ message: `Long press detected on cell (${r}, ${c})` });
          handleCellRightClick(r, c);
          resolve();
        }, holdToFlagDurationMs);

        const signal = controller.signal;
        signal.addEventListener("abort", () => {
          state = "rejected";
          addLog({
            message: `Long press aborted on cell (${r}, ${c})`,
          });

          clearTimeout(timerId);
          reject();
        });
      });

      const getState = () => state;
      const abort = () => controller.abort();

      controllerRef.current = { abort, getState };

      return promise;
    },
    [holdToFlagDurationMs, handleCellRightClick, addLog],
  );

  const abortLongPressPromise = useCallback(() => {
    if (!controllerRef.current) {
      return;
    }

    controllerRef.current.abort();
  }, []);

  const handleChangeCellState = useCallback(
    (callback: ChangeCellStateCallback) => {
      const { getState } = controllerRef.current || {};

      const cleanup = () => {
        controllerRef.current = null;
      };

      const promiseState = getState?.() || null;
      if (promiseState === "resolved") {
        addLog({ message: `Long press already handled, skipping callback` });
        cleanup();
        return;
      }

      controllerRef.current?.abort();
      addLog({ message: `Executing cell state change callback` });

      // rejectされていなければcallbackを実行
      if (promiseState === "pending") {
        callback();
      }

      cleanup();
    },
    [addLog],
  );

  const mouseDownCell = useRef<{ r: number; c: number } | null>(null);

  const lastMouseButtonRef = useRef<number | null>(null);

  const handlePointerDown = useCallback(
    (r: number, c: number) => {
      makeLongPressPromise(r, c);
      addLog({ message: `⌚Start timer on cell (${r}, ${c})` });
    },
    [makeLongPressPromise, addLog],
  );

  const handleSetFlag = useCallback(
    (r: number, c: number) => {
      abortLongPressPromise();

      addLog({ message: `🚩Set flag on cell (${r}, ${c})` });
      handleCellRightClick(r, c);

      mouseDownCell.current = null;
    },
    [handleCellRightClick, abortLongPressPromise, addLog],
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
          abortLongPressPromise();
        }}
        onPinchingStart={(_ref, e) => {
          addLog({ message: `${e.type}: onPinchingStart` });
          abortLongPressPromise();
        }}
        onZoomStart={(_ref, e) => {
          addLog({ message: `${e.type}: onZoomStart` });
          abortLongPressPromise();
        }}
        onWheelStart={(_ref, e) => {
          addLog({ message: `${e.type}: onWheelStart` });
          abortLongPressPromise();
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
                        onMouseUp={() => handleCellClick(r, c)}
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
                      }}
                      onPointerUp={(e) => {
                        addLog({ message: e.type });
                        if (e.pointerType === "mouse") {
                          // onMouseUpで処理するのでので無視
                          return;
                        }
                        e.preventDefault();
                        handleChangeCellState(() => {
                          handleCellClick(r, c);
                        });
                      }}
                      onMouseDown={(e) => {
                        addLog({ message: e.type });
                        lastMouseButtonRef.current = e.button;
                        handlePointerDown(r, c);
                      }}
                      onMouseUp={(e) => {
                        addLog({ message: e.type });

                        if (lastMouseButtonRef.current === null) {
                          addLog({
                            message: `No mouse button recorded, ignoring onMouseUp`,
                          });
                          return;
                        }

                        // if (_lockHandle.current) {
                        //   setLockState(false, "onMouseUp locked");
                        //   return;
                        // }

                        // 最後に押されたボタンに応じて処理を分岐
                        const button = lastMouseButtonRef.current;
                        lastMouseButtonRef.current = null;

                        switch (button) {
                          case 0: // 左クリック
                            // handleChangeCellState(() => handleCellOpen(r, c));
                            handleChangeCellState(() => {
                              addLog({
                                message: `💣Cell open on cell (${r}, ${c})`,
                              });
                              handleCellClick(r, c);
                            });
                            break;

                          case 2: // 右クリック
                            handleChangeCellState(() => {
                              handleSetFlag(r, c);
                            });
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
                          abortLongPressPromise();
                        }
                      }}
                      onTouchMove={(e) => {
                        addLog({ message: e.type });
                        // スクロールなどで指が動いたらロック
                        abortLongPressPromise();
                      }}
                      onTouchEnd={(e) => {
                        addLog({
                          message: `${e.type}: touches: ${e.touches.length}`,
                        });
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

import mulberry32Generator from "../lib/mulberry32Generator";
import type { Cell, CellState } from "./game/types";

export const initializeBoard = (
  rows: number,
  cols: number,
  mineCount: number,
  clickedRow: number,
  clickedCol: number,
  seed?: number,
): Cell[][] => {
  const newBoard: Cell[][] = Array(rows)
    .fill(null)
    .map(() =>
      Array(cols)
        .fill(null)
        .map(() => ({
          isMine: false,
          state: "closed" as CellState,
          adjacentMines: 0,
        })),
    );

  const mines = new Set<string>();

  // console.log("seed", seed);
  // TODO: seed の管理を改善したのち、引数に seed を追加する
  const rng = mulberry32Generator();

  while (mines.size < mineCount) {
    const r = Math.floor(rng.next().value * rows);
    const c = Math.floor(rng.next().value * cols);

    const key = `${r},${c}`;
    if (r === clickedRow && c === clickedCol) {
      continue;
    }

    if (Math.abs(r - clickedRow) <= 1 && Math.abs(c - clickedCol) <= 1) {
      continue;
    }
    mines.add(key);
  }

  mines.forEach((key) => {
    const [r, c] = key.split(",").map(Number);
    newBoard[r][c].isMine = true;
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].isMine) {
        continue;
      }

      let mineCount = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          // 自分自身のセルはスキップ
          if (dr === 0 && dc === 0) {
            continue;
          }

          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            newBoard[nr][nc].isMine
          ) {
            mineCount++;
          }
        }
      }
      newBoard[r][c].adjacentMines = mineCount;
    }
  }

  return newBoard;
};

export const openCell = (
  r: number,
  c: number,
  board: Cell[][],
  rows: number,
  cols: number,
): void => {
  if (
    r < 0 ||
    r >= rows ||
    c < 0 ||
    c >= cols ||
    board[r][c].state !== "closed"
  )
    return;

  board[r][c].state = "opened";

  if (board[r][c].adjacentMines === 0 && !board[r][c].isMine) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        openCell(r + dr, c + dc, board, rows, cols);
      }
    }
  }
};

export const revealAllMines = (
  board: Cell[][],
  rows: number,
  cols: number,
): void => {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine && board[r][c].state !== "flagged") {
        board[r][c].state = "opened";
      }
    }
  }
};

export const checkWin = (
  board: Cell[][],
  rows: number,
  cols: number,
): boolean => {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].isMine && board[r][c].state !== "opened") {
        return false;
      }
    }
  }
  return true;
};

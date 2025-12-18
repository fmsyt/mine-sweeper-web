import type { difficultyMap } from "./constants";

export type CellState = "closed" | "opened" | "flagged";

export type Cell = {
  isMine: boolean;
  state: CellState;
  adjacentMines: number;
};

export type DifficultyKey = (typeof difficultyMap)[number]["key"];

export type GameConfig = {
  rows: number;
  cols: number;
  mines: number;

  showFlagAnimation?: boolean;
  holdToFlagDurationMs?: number;
};

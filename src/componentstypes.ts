export type CellState = "closed" | "opened" | "flagged";

export type Cell = {
  isMine: boolean;
  state: CellState;
  adjacentMines: number;
};

export type Difficulty = "beginner" | "intermediate" | "expert" | "custom";

export type GameConfig = {
  rows: number;
  cols: number;
  mines: number;

  showFlagAnimation?: boolean;
  holdToFlagDurationMs?: number;
};

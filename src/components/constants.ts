import type { Difficulty, GameConfig } from "../componentstypes";

export const DIFFICULTY_PRESETS: Record<
  Exclude<Difficulty, "custom">,
  GameConfig
> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

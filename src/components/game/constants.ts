import type { DifficultyKey, GameConfig } from "./types";

export const DIFFICULTY_PRESETS: Record<
  Exclude<DifficultyKey, "custom">,
  GameConfig
> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

export const difficultyMap = [
  {
    key: "beginner",
    label: "初級",
  },
  {
    key: "intermediate",
    label: "中級",
  },
  {
    key: "expert",
    label: "上級",
  },
  {
    key: "custom",
    label: "カスタム",
  },
] as const;

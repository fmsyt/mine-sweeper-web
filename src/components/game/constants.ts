import type { DifficultyKey, GameConfig } from "./types";

export const DIFFICULTY_PRESETS: Record<
  Exclude<DifficultyKey, "custom">,
  GameConfig
> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

type DifficultyOption = {
  id: string;
  label: string;
  description?: string;
};

export const difficultyMap: DifficultyOption[] = [
  {
    id: "beginner",
    label: "初級",
    description: "9x9 グリッド、10 個の地雷",
  },
  {
    id: "intermediate",
    label: "中級",
    description: "16x16 グリッド、40 個の地雷",
  },
  {
    id: "expert",
    label: "上級",
    description: "16x30 グリッド、99 個の地雷",
  },
  {
    id: "custom",
    label: "カスタム",
  },
] as const;

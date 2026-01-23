import { useCallback, useState } from "react";
import { DIFFICULTY_PRESETS } from "../components/game/constants";
import type { GameConfig } from "../components/game/types";

const STORAGE_KEY = "minesweeper-config";

type GameConfigExt = GameConfig & {
  difficulty?: string;
};

type StoredConfig = Partial<GameConfigExt>;

const DEFAULT_CONFIG: GameConfig = {
  rows: 9,
  cols: 9,
  mines: 10,
  showFlagAnimation: true,
  holdToFlagDurationMs: 300,
};

interface LocalStorageContextType<T, U = T> {
  config: U;
  updateConfig: (updates: Partial<T>) => void;
  resetConfig: () => void;
}

function getDiffultyFromConfig(
  config: Pick<GameConfig, "rows" | "cols" | "mines">,
): string {
  const { rows, cols, mines } = config;
  for (const [key, preset] of Object.entries(DIFFICULTY_PRESETS)) {
    if (
      preset.rows === rows &&
      preset.cols === cols &&
      preset.mines === mines
    ) {
      return key;
    }
  }

  return "custom";
}

export function useLocalStorage(): LocalStorageContextType<
  GameConfig,
  StoredConfig
> {
  const [config, setConfig] = useState<StoredConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const config = {
          ...DEFAULT_CONFIG,
          ...parsed,
          difficulty: getDiffultyFromConfig(parsed),
        };

        return config;
      }
    } catch (error) {
      console.error("Failed to load config from localStorage:", error);
    }
    return DEFAULT_CONFIG;
  });

  const updateConfig = useCallback((updates: Partial<GameConfig>) => {
    // setConfig((prev) => ({ ...prev, ...updates }));
    setConfig((prev) => {
      const nextConfig = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
      } catch (error) {
        console.error("Failed to save config to localStorage:", error);
      }

      return nextConfig;
    });
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
    } catch (error) {
      console.error("Failed to save config to localStorage:", error);
    }
  }, []);

  return {
    config,
    updateConfig,
    resetConfig,
  };
}

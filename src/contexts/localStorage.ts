import { useCallback, useState } from "react";
import type { GameConfig } from "../componentstypes";

const STORAGE_KEY = "minesweeper-config";

const DEFAULT_CONFIG: GameConfig = {
  rows: 9,
  cols: 9,
  mines: 10,
  showFlagAnimation: true,
  holdToFlagDurationMs: 300,
};

interface LocalStorageContextType {
  config: GameConfig;
  updateConfig: (updates: Partial<GameConfig>) => void;
  resetConfig: () => void;
}

export function useLocalStorage(): LocalStorageContextType {
  const [config, setConfig] = useState<GameConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_CONFIG, ...parsed };
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

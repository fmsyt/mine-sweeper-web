import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { GameConfig } from "../componentstypes";

const STORAGE_KEY = "minesweeper-config";

const DEFAULT_CONFIG: GameConfig = {
  rows: 9,
  cols: 9,
  mines: 10,
  showFlagAnimation: true,
  holdToFlagDurationMs: 500,
};

interface LocalStorageContextType {
  config: GameConfig;
  updateConfig: (updates: Partial<GameConfig>) => void;
  resetConfig: () => void;
}

const LocalStorageContext = createContext<LocalStorageContextType | undefined>(
  undefined,
);

export function LocalStorageProvider({ children }: { children: ReactNode }) {
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Failed to save config to localStorage:", error);
    }
  }, [config]);

  const updateConfig = (updates: Partial<GameConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <LocalStorageContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </LocalStorageContext.Provider>
  );
}

export function useLocalStorage() {
  const context = useContext(LocalStorageContext);
  if (context === undefined) {
    throw new Error(
      "useLocalStorage must be used within a LocalStorageProvider",
    );
  }
  return context;
}

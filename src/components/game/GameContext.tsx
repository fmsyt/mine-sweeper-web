import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useLocalStorage } from "../../contexts/localStorage";
import { playClickSound, preloadClickSound } from "../../utils/audio";
import {
  checkWin,
  initializeBoard,
  openCell,
  revealAllMines,
} from "../gameLogic";
import { DIFFICULTY_PRESETS } from "./constants";
import type { Cell, DifficultyKey, GameConfig } from "./types";

interface GameContextType {
  difficulty: DifficultyKey;
  rows: number;
  cols: number;
  mineCount: number;
  board: Cell[][] | null;
  gameOver: boolean;
  gameWon: boolean;
  firstClick: boolean;
  elapsedTime: number;
  flagCount: number;
  showFlagAnimation: boolean;
  holdToFlagDurationMs: number;
  animatingFlags: Set<string>;
  startPosition?: { r: number; c: number };
  handleDifficultyChange: (newDifficulty: DifficultyKey) => void;
  handleCustomChange: (type: "rows" | "cols" | "mines", value: number) => void;
  toggleFlagAnimation: () => void;
  setHoldToFlagDurationMs: (value: number) => void;
  handleCellClick: (r: number, c: number) => void;
  handleCellRightClick: (
    r: number,
    c: number,
    disableAnimation?: boolean,
  ) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export type GameProviderProps = {
  children: ReactNode;
  gameConfig?: GameConfig;
};

export function GameProvider(props: GameProviderProps) {
  const { children } = props;

  const { config, updateConfig } = useLocalStorage();

  const [difficulty, setDifficulty] = useState<DifficultyKey>(
    config.difficulty ?? "beginner",
  );
  const [rows, setRows] = useState(props.gameConfig?.rows ?? config.rows);
  const [cols, setCols] = useState(props.gameConfig?.cols ?? config.cols);
  const [mineCount, setMineCount] = useState(
    props.gameConfig?.mines ?? config.mines,
  );
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [flagCount, setFlagCount] = useState(0);

  const [seed, setSeed] = useState(props.gameConfig?.seed ?? Date.now());

  const [startPosition] = useState(props.gameConfig?.startPosition);

  const [board, setBoard] = useState<Cell[][] | null>(() => {
    if (startPosition) {
      return initializeBoard(
        rows,
        cols,
        mineCount,
        startPosition.r,
        startPosition.c,
        seed,
      );
    }
    return null;
  });

  const [showFlagAnimation, setShowFlagAnimation] = useState(
    props.gameConfig?.showFlagAnimation ?? config.showFlagAnimation ?? true,
  );

  const [holdToFlagDurationMs, setHoldToFlagDurationMs] = useState(
    props.gameConfig?.holdToFlagDurationMs ??
    config.holdToFlagDurationMs ??
    500,
  );
  const [animatingFlags, setAnimatingFlags] = useState<Set<string>>(new Set());

  useLayoutEffect(() => {
    preloadClickSound();
  }, []);

  useEffect(() => {
    if (gameOver || gameWon || firstClick) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, gameWon, firstClick]);

  const handleDifficultyChange = (newDifficulty: DifficultyKey) => {
    setDifficulty(newDifficulty);
    if (newDifficulty !== "custom") {
      const preset = DIFFICULTY_PRESETS[newDifficulty];
      const { rows, cols, mines } = preset;

      setRows(rows);
      setCols(cols);
      setMineCount(mines);

      updateConfig({ rows, cols, mines });
    }
  };

  const handleCustomChange = (
    type: "rows" | "cols" | "mines",
    value: number,
  ) => {
    setDifficulty("custom");
    if (type === "rows") {
      const newRows = Math.max(5, value);
      setRows(newRows);
      updateConfig({ rows: newRows });
    } else if (type === "cols") {
      const newCols = Math.max(5, value);
      setCols(newCols);
      updateConfig({ cols: newCols });
    } else {
      const newMines = Math.min(Math.max(1, value), rows * cols - 9);
      setMineCount(newMines);
      updateConfig({ mines: newMines });
    }
  };

  const toggleFlagAnimation = () => {
    setShowFlagAnimation((prev) => {
      const newValue = !prev;
      updateConfig({ showFlagAnimation: newValue });
      return newValue;
    });
  };

  const handleSetHoldToFlagDurationMs = (value: number) => {
    setHoldToFlagDurationMs(value);
    updateConfig({ holdToFlagDurationMs: value });
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || gameWon) return;

    if (firstClick) {
      const newBoard = (
        board ?? initializeBoard(rows, cols, mineCount, r, c, seed)
      ).map((row) => row.map((cell) => ({ ...cell })));

      openCell(r, c, newBoard, rows, cols);
      setBoard(newBoard);
      setFirstClick(false);
      setElapsedTime(0);
      playClickSound();

      if (checkWin(newBoard, rows, cols)) {
        setGameWon(true);
      }
      return;
    }

    if (!board) return;

    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

    if (newBoard[r][c].state === "flagged") return;

    if (newBoard[r][c].state === "opened") {
      const adjacentMines = newBoard[r][c].adjacentMines;
      let flaggedCount = 0;

      let playedSound = false;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            newBoard[nr][nc].state === "flagged"
          ) {
            if (!playedSound) {
              playClickSound();
              playedSound = true;
            }
            flaggedCount++;
          }
        }
      }

      if (flaggedCount === adjacentMines) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              newBoard[nr][nc].state === "closed"
            ) {
              if (newBoard[nr][nc].isMine) {
                setGameOver(true);
                revealAllMines(newBoard, rows, cols);
                setBoard(newBoard);
                return;
              }
              openCell(nr, nc, newBoard, rows, cols);
            }
          }
        }
      }
    } else if (newBoard[r][c].state === "closed") {
      playClickSound();
      if (newBoard[r][c].isMine) {
        setGameOver(true);
        newBoard[r][c].state = "opened";
        revealAllMines(newBoard, rows, cols);
      } else {
        openCell(r, c, newBoard, rows, cols);
      }
    }

    setBoard(newBoard);
    if (checkWin(newBoard, rows, cols)) {
      setGameWon(true);
    }
  };

  const handleCellRightClick = (
    r: number,
    c: number,
    disableAnimation = true,
  ) => {
    if (gameOver || gameWon || !board || firstClick) return;

    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    const cellKey = `${r}-${c}`;

    const animation = () => {
      setAnimatingFlags((prev) => new Set(prev).add(cellKey));
      setTimeout(() => {
        setAnimatingFlags((prev) => {
          const next = new Set(prev);
          next.delete(cellKey);
          return next;
        });
      }, 400);
    };

    if (newBoard[r][c].state === "closed") {
      newBoard[r][c].state = "flagged";
      setFlagCount((prev) => prev + 1);
      playClickSound();

      if (!disableAnimation && showFlagAnimation) {
        animation();
      }
    } else if (newBoard[r][c].state === "flagged") {
      newBoard[r][c].state = "closed";
      setFlagCount((prev) => prev - 1);
      playClickSound();

      if (!disableAnimation && showFlagAnimation) {
        animation();
      }
    }

    setBoard(newBoard);
  };

  const resetGame = () => {
    setGameOver(false);
    setGameWon(false);
    setFirstClick(true);
    setElapsedTime(0);
    setFlagCount(0);
    setAnimatingFlags(new Set());

    const shouldResetSeed = props.gameConfig?.resetSeedOnReset ?? true;
    const newSeed = shouldResetSeed ? Date.now() : seed;
    if (shouldResetSeed) {
      setSeed(newSeed);
    }

    if (startPosition) {
      setBoard(
        initializeBoard(
          rows,
          cols,
          mineCount,
          startPosition.r,
          startPosition.c,
          newSeed,
        ),
      );
    } else {
      setBoard(null);
    }
  };

  return (
    <GameContext.Provider
      value={{
        difficulty,
        rows,
        cols,
        mineCount,
        board,
        gameOver,
        gameWon,
        firstClick,
        elapsedTime,
        flagCount,
        showFlagAnimation,
        holdToFlagDurationMs,
        animatingFlags,
        startPosition,
        handleDifficultyChange,
        handleCustomChange,
        toggleFlagAnimation,
        setHoldToFlagDurationMs: handleSetHoldToFlagDurationMs,
        handleCellClick,
        handleCellRightClick,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

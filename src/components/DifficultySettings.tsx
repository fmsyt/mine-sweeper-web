import { useCallback } from "react";
import type { Difficulty } from "../componentstypes";
import { useGame } from "../contexts/GameContext";

export function DifficultySettings() {
  const {
    difficulty,
    rows,
    cols,
    mineCount,
    showFlagAnimation,
    holdToFlagDurationMs,
    handleDifficultyChange,
    handleCustomChange,
    toggleFlagAnimation,
    setHoldToFlagDurationMs,
  } = useGame();

  const makeActiveClass = useCallback(
    (label: Difficulty) => {
      const classList = ["btn", "btn-primary", "flex-1", "text-nowrap"];
      if (difficulty === label) {
        classList.push("btn-active");
      }

      return classList.join(" ");
    },
    [difficulty],
  );

  return (
    <div className="flex flex-col items-center align-center gap-4 pt-4">
      <div className="flex flex-row gap-2 justify-center flex-wrap">
        <button
          type="button"
          className={makeActiveClass("beginner")}
          onClick={() => handleDifficultyChange("beginner")}
        >
          初級
        </button>
        <button
          type="button"
          className={makeActiveClass("intermediate")}
          onClick={() => handleDifficultyChange("intermediate")}
        >
          中級
        </button>
        <button
          type="button"
          className={makeActiveClass("expert")}
          onClick={() => handleDifficultyChange("expert")}
        >
          上級
        </button>
        <button
          type="button"
          className={makeActiveClass("custom")}
          onClick={() => handleDifficultyChange("custom")}
        >
          カスタム
        </button>
      </div>

      <div className="flex flex-row gap-4 justify-center custom-settings">
        <label className="input input-xs">
          <span className="label">Rows</span>
          <input
            type="number"
            value={rows}
            onChange={(e) => handleCustomChange("rows", Number(e.target.value))}
            min="5"
            max="30"
          />
        </label>
        <label className="input input-xs">
          <span className="label">Columns</span>
          <input
            type="number"
            value={cols}
            onChange={(e) => handleCustomChange("cols", Number(e.target.value))}
            min="5"
            max="30"
          />
        </label>
        <label className="input input-xs">
          <span className="label">Mines</span>
          <input
            type="number"
            value={mineCount}
            onChange={(e) =>
              handleCustomChange("mines", Number(e.target.value))
            }
            min="1"
            max={rows * cols - 9}
          />
        </label>
      </div>

      <div className="animation-toggle">
        <label className="label">
          <input
            type="checkbox"
            className="checkbox"
            checked={showFlagAnimation}
            onChange={toggleFlagAnimation}
          />
          フラグアニメーション
        </label>
      </div>

      <div className="hold-duration-setting">
        <label className="flex flex-row justify-center align-center gap-2">
          長押し時間: {holdToFlagDurationMs}ms
          <input
            type="range"
            className="slider"
            value={holdToFlagDurationMs}
            onChange={(e) => setHoldToFlagDurationMs(Number(e.target.value))}
            min="100"
            max="2000"
            step="50"
          />
        </label>
      </div>
    </div>
  );
}

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
      const classList = ["btn"];
      if (difficulty === label) {
        classList.push("active");
      }

      return classList.join(" ");
    },
    [difficulty],
  );

  return (
    <div className="settings">
      <div className="difficulty-buttons">
        <button
          type="button"
          className={makeActiveClass("beginner")}
          onClick={() => handleDifficultyChange("beginner")}
        >
          初級 (9×9, 10)
        </button>
        <button
          type="button"
          className={makeActiveClass("intermediate")}
          onClick={() => handleDifficultyChange("intermediate")}
        >
          中級 (16×16, 40)
        </button>
        <button
          type="button"
          className={makeActiveClass("expert")}
          onClick={() => handleDifficultyChange("expert")}
        >
          上級 (16×30, 99)
        </button>
        <button
          type="button"
          className={makeActiveClass("custom")}
          onClick={() => handleDifficultyChange("custom")}
        >
          カスタム
        </button>
      </div>

      {difficulty === "custom" && (
        <div className="custom-settings">
          <div>
            <label>
              Rows:
              <input
                type="number"
                value={rows}
                onChange={(e) =>
                  handleCustomChange("rows", Number(e.target.value))
                }
                min="5"
                max="30"
              />
            </label>
          </div>
          <div>
            <label>
              Columns:
              <input
                type="number"
                value={cols}
                onChange={(e) =>
                  handleCustomChange("cols", Number(e.target.value))
                }
                min="5"
                max="30"
              />
            </label>
          </div>
          <div>
            <label>
              Mines:
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
        </div>
      )}

      <div className="animation-toggle">
        <label>
          <input
            type="checkbox"
            checked={showFlagAnimation}
            onChange={toggleFlagAnimation}
          />
          フラグアニメーション
        </label>
      </div>

      <div className="hold-duration-setting">
        <label>
          長押し時間: {holdToFlagDurationMs}ms
          <input
            type="range"
            value={holdToFlagDurationMs}
            onChange={(e) => setHoldToFlagDurationMs(Number(e.target.value))}
            min="100"
            max="2000"
            step="50"
          />
        </label>
      </div>

      <p className="instruction">👇 Click any cell below to start the game!</p>
    </div>
  );
}

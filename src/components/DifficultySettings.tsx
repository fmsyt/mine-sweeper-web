import { difficultyMap } from "./game/constants";
import { useGame } from "./game/GameContext";

export function DifficultySettings() {
  const {
    board,
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

  return (
    <div className="flex flex-col gap-4">
      <div className="font-bold text-lg">難易度</div>
      <div className="flex flex-row gap-4 justify-center flex-wrap">
        {Object.values(difficultyMap).map(({ key, label }) => (
          <label key={key} className="label">
            <input
              type="radio"
              name="difficulty"
              className="radio"
              defaultChecked={difficulty === key}
              onClick={() => handleDifficultyChange(key)}
              disabled={Boolean(board)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {difficulty === "custom" && (
        <div className="flex flex-col gap-4 justify-center">
          <label className="input input-sm">
            <span className="label w-[8em]">Rows</span>
            <input
              type="number"
              value={rows}
              onChange={(e) =>
                handleCustomChange("rows", Number(e.target.value))
              }
              min="5"
              max="30"
              disabled={difficulty !== "custom"}
            />
          </label>
          <label className="input input-sm">
            <span className="label w-[8em]">Columns</span>
            <input
              type="number"
              value={cols}
              onChange={(e) =>
                handleCustomChange("cols", Number(e.target.value))
              }
              min="5"
              max="30"
              disabled={difficulty !== "custom"}
            />
          </label>
          <label className="input input-sm">
            <span className="label w-[8em]">Mines</span>
            <input
              type="number"
              value={mineCount}
              onChange={(e) =>
                handleCustomChange("mines", Number(e.target.value))
              }
              min="1"
              max={rows * cols - 9}
              disabled={difficulty !== "custom"}
            />
          </label>
        </div>
      )}

      <div className="font-bold text-lg mt-4">タッチ操作</div>
      <fieldset className="fieldset">
        <div className="fieldset-legend">アニメーション</div>
        <label className="label ">
          <input
            type="checkbox"
            className="checkbox"
            checked={showFlagAnimation}
            onChange={toggleFlagAnimation}
          />
          フラグ設置アニメーションを表示する
        </label>
      </fieldset>

      <fieldset className="fieldset">
        <div className="fieldset-legend">
          長押し時間: {holdToFlagDurationMs}ms
        </div>
        <input
          type="range"
          className="slider"
          value={holdToFlagDurationMs}
          onChange={(e) => setHoldToFlagDurationMs(Number(e.target.value))}
          min="100"
          max="1000"
          step="50"
        />
        <p className="label">
          セルの長押しでフラグを設置するまでの時間を調整します。
        </p>
      </fieldset>
    </div>
  );
}

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
    swapRowsAndCols,
    toggleFlagAnimation,
    setHoldToFlagDurationMs,
  } = useGame();

  return (
    <div className="flex flex-col gap-4">
      <div className="font-bold text-lg">難易度</div>
      <div className="flex flex-col gap-4 justify-center flex-wrap">
        {Object.values(difficultyMap).map(({ id: key, label, description }) => (
          <label key={key} className="label">
            <input
              type="radio"
              name="difficulty"
              className="radio"
              defaultChecked={difficulty === key}
              onClick={() => handleDifficultyChange(key)}
              disabled={Boolean(board)}
            />
            <div className="flex-inline text-nowrap ml-2">
              <div className="block-inline"> {label}</div>
              <div className="block-inline ml-1 font-normal text-sm text-gray-500">
                {description}
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-6 justify-center mt-4">
        {/* rows - cols */}
        <div className="flex flex-row gap-4">
          {/* button wrapper */}
          <div className="flex flex-col gap-6 grow">
            <label className="floating-label shrink-0">
              <input
                placeholder="幅"
                className="input input-md w-full"
                type="number"
                value={cols}
                onChange={(e) =>
                  handleCustomChange("cols", Number(e.target.value))
                }
                min="5"
                max="30"
                disabled={difficulty !== "custom"}
              />
              <span>幅</span>
            </label>
            <label className="floating-label">
              <input
                placeholder="高さ"
                className="input input-md w-full"
                type="number"
                value={rows}
                onChange={(e) =>
                  handleCustomChange("rows", Number(e.target.value))
                }
                min="5"
                max="30"
                disabled={difficulty !== "custom"}
              />
              <span>高さ</span>
            </label>
          </div>

          <div className="flex items-center justify-center gap-2 shrink-0">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={swapRowsAndCols}
              disabled={Boolean(board)}
            >
              ↑↓
            </button>
          </div>
        </div>

        <label className="floating-label">
          <input
            placeholder="Mines"
            className="input input-md"
            type="number"
            value={mineCount}
            onChange={(e) =>
              handleCustomChange("mines", Number(e.target.value))
            }
            min="1"
            max={rows * cols - 9}
            disabled={difficulty !== "custom"}
          />
          <span>地雷の数</span>
        </label>
      </div>

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

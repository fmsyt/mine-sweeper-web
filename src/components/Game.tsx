import { Box, Stack } from "@mui/system";
import { useEffect, useMemo, useRef } from "react";
import "../styles/game.css";
import { DifficultySettings } from "./DifficultySettings";
import { GameBoard } from "./GameBoard";
import { GameStatus } from "./GameStatus";
import { GameProvider, useGame } from "./game/GameContext";
import type { GameConfig } from "./game/types";

type GameInnerProps = {
  showSettingsOnStart?: boolean;
};

function GameInner(props: GameInnerProps) {
  const { gameOver, gameWon } = useGame();

  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (props.showSettingsOnStart === false) {
      return;
    }

    const timer = setTimeout(() => {
      dialogRef.current?.showModal();
    }, 20);

    return () => clearTimeout(timer);
  }, [props.showSettingsOnStart]);

  return (
    <Stack
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        height: "100svh",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Box
        display="grid"
        gridTemplateRows="fit-content(100%) 1fr fit-content(100%)"
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          mb={2}
        >
          <GameStatus />
        </Stack>

        <Box className="outline outline-1 outline-gray-400">
          <GameBoard />
        </Box>

        <Box height="1em" sx={{ textAlign: "center" }}>
          {gameOver && "Game Over! 💥"}
          {gameWon && "You Win! 🎉"}
        </Box>
      </Box>

      <dialog ref={dialogRef} className="modal">
        <div
          className="modal-box max-h-[80svh] overflow-y-auto"
          style={{ opacity: 0.95 }}
        >
          <DifficultySettings />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>

      <Box className="fab">
        <button
          type="button"
          className="btn btn-lg btn-circle btn-default"
          onClick={() => {
            dialogRef.current?.showModal();
          }}
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </Box>
    </Stack>
  );
}

type GameProps = {
  gameConfig?: GameConfig;
};

function Game(props: GameProps) {
  const showSettingsOnStart = useMemo(() => {
    if (!props.gameConfig) {
      return true;
    }

    const requiredFields: Array<keyof GameConfig> = ["rows", "cols", "mines"];
    return requiredFields.some(
      (field) => props.gameConfig?.[field] === undefined,
    );
  }, [props.gameConfig]);

  return (
    <GameProvider gameConfig={props.gameConfig}>
      <GameInner showSettingsOnStart={showSettingsOnStart} />
    </GameProvider>
  );
}

export default Game;

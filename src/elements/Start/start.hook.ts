import type { ThreeEvent } from "@react-three/fiber";
import type { GameInfos } from "@/scenes/Game/game.types";
import { type SetStateAction, type Dispatch } from "react";

export function useStart(
  gameInfos: GameInfos,
  setGameInfos: Dispatch<SetStateAction<GameInfos>>,
) {
  function handlePointerEnter(e: ThreeEvent<PointerEvent>) {
    if (gameInfos.grabbing !== "rolly") return;
    e.stopPropagation();
    setGameInfos((prev) => ({
      ...prev,
      tileHovered: {
        type: "start",
        id: null,
      },
    }));
    console.log("test");
  }
  function handlePointerLeave(e: ThreeEvent<PointerEvent>) {
    if (gameInfos.grabbing !== "rolly") return;
    e.stopPropagation();
    setGameInfos((prev) => ({
      ...prev,
      tileHovered: {
        type: null,
        id: null,
      },
    }));
  }
  return {
    start: { handlePointerEnter, handlePointerLeave },
  };
}

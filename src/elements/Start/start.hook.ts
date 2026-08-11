import type { ThreeEvent } from "@react-three/fiber";
import type { GameInfos } from "@/scenes/Game/game.types";
import { type RefObject } from "react";

export function useStart(gameInfos: RefObject<GameInfos>) {
  function handlePointerEnter(e: ThreeEvent<PointerEvent>) {
    if (gameInfos.current.grabbing !== "rolly") return;
    e.stopPropagation();
    gameInfos.current.placeHovered = {
      type: "start",
      id: null,
    };
  }
  return {
    start: { handlePointerEnter },
  };
}

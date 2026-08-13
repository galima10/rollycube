import type { ThreeEvent } from "@react-three/fiber";
import type { GameInfos } from "@/Game/Scene/game.types";
import { type RefObject } from "react";

export function useBucket(gameInfos: RefObject<GameInfos>) {
  function handlePointerEnter(e: ThreeEvent<PointerEvent>, bucketId: number) {
    if (gameInfos.current.grabbing !== "rolly") return;
    e.stopPropagation();
    gameInfos.current.placeHovered = {
      type: "bucket",
      id: bucketId,
    };
  }
  return {
    buckets: { handlePointerEnter },
  };
}

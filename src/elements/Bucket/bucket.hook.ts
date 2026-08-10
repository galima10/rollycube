import type { ThreeEvent } from "@react-three/fiber";
import type { GameInfos } from "@/scenes/Game/game.types";
import { type SetStateAction, type Dispatch } from "react";

export function useBucket(
  gameInfos: GameInfos,
  setGameInfos: Dispatch<SetStateAction<GameInfos>>,
) {
  function handlePointerEnter(e: ThreeEvent<PointerEvent>, bucketId: number) {
    if (gameInfos.grabbing !== "rolly") return;
    e.stopPropagation();
    setGameInfos((prev) => ({
      ...prev,
      placeHovered: {
        type: "bucket",
        id: bucketId,
      },
    }));
  }
  return {
    buckets: { handlePointerEnter },
  };
}

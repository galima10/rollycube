import type { GameInfos } from "@/scenes/Game/game.types";
import { type RefObject} from "react";

export function useRoll(
  gameInfos: RefObject<GameInfos>,
) {
  function rollRolly(delta: number) {
    if (gameInfos.current.grabbing !== "board" && !gameInfos.current.board.isLeaning)
      return;
    // const axis = gameRefs.current.board.leanAxis;
    // const direction = 
  }

  function getTargetDirection(){

  }
  return { rollRolly };
}

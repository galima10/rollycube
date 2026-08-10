import type { GameInfos, GameRefs } from "@/scenes/Game/game.types";
import { type RefObject, type Dispatch, type SetStateAction } from "react";

export function useRoll(
  gameInfos: GameInfos,
  setGameInfos: Dispatch<SetStateAction<GameInfos>>,
  gameRefs: RefObject<GameRefs>,
) {
  function rollRolly(delta: number) {
    if (gameInfos.grabbing !== "board" && !gameRefs.current.board.isLeaning)
      return;
    // const axis = gameRefs.current.board.leanAxis;
    // const direction = 
  }

  function getTargetDirection(){
    
  }
  return { rollRolly };
}

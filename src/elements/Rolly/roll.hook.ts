import type { GameInfos } from "@/scenes/Game/game.types";
import { type RefObject, useEffect, useRef } from "react";
import type { RollDirection } from "./rolly.types";
import { type Group } from "three";

export function useRoll(
  gameInfos: RefObject<GameInfos>,
  refs: {
    rollyRef: RefObject<Group>;
    pivotRef: RefObject<Group>;
  },
) {
  const { rollyRef, pivotRef } = refs;
  const HALF_SIZE = 0.5;
  const rollState = useRef({
    progress: 0,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        testRollBackward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function testRollBackward() {
    const rolly = rollyRef.current;
    const pivot = pivotRef.current;

    if (!rolly || !pivot) return;

    const offset = getPivotOffset("backward");

    /*
     * Position actuelle du centre de Rolly.
     */
    const worldPosition = rolly.position.clone();

    /*
     * Le pivot est placé sur l'arête arrière.
     */
    pivot.position.set(
      worldPosition.x + offset.x,
      worldPosition.y + offset.y,
      worldPosition.z + offset.z,
    );

    /*
     * On compense le déplacement du pivot
     * en positionnant Rolly dans l'espace local du pivot.
     */
    rolly.position.set(-offset.x, -offset.y, -offset.z);

    /*
     * On démarre l'animation.
     */
    pivot.rotation.set(0, 0, 0);

    gameInfos.current.rolly.isRolling = true;
    rollState.current.progress = 0;
  }

  // function rollRolly(delta: number) {
  //   if (
  //     gameInfos.current.grabbing !== "board" &&
  //     !gameInfos.current.board.isLeaning
  //   )
  //     return;
  //   if (!isRolling.current) return;
  //   const maxAngleX = Math.PI / 2;
  //   const direction = getTargetDirection();
  // }

  function rollRolly(delta: number) {
    if (
      gameInfos.current.grabbing !== "board" &&
      !gameInfos.current.board.isLeaning
    )
      return;
    // if (!gameInfos.current.rolly.isRolling) return;
    const pivot = pivotRef.current;
    if (!pivot) return;

    const state = rollState.current;

    const direction = getTargetDirection();
    console.log(direction)


    /*
     * Durée du roulement : 0.3 seconde.
     */
    state.progress += delta / 0.3;

    const progress = Math.min(state.progress, 1);

    /*
     * 0 -> PI/2
     */
    pivot.rotation.x = progress * (Math.PI / 2);

    if (progress >= 1) {
      finishRoll();
    }
  }

  function getTargetDirection(): RollDirection {
    const axis = gameInfos.current.board.leanAxis;
    if (!axis) return;

    if (axis === "x")
      return gameInfos.current.board.rotation.x > 0 ? "backward" : "forward";
    else return gameInfos.current.board.rotation.z > 0 ? "left" : "right";
  }

  function finishRoll() {
    const rolly = rollyRef.current;
    const pivot = pivotRef.current;

    if (!rolly || !pivot) return;

    /*
     * TODO : pour l'instant on laisse le pivot en place.
     * On s'occupera ensuite de "baker" sa transformation
     * dans Rolly.
     */

    gameInfos.current.rolly.isRolling = false;
  }

  function getPivotOffset(direction: RollDirection) {
    if (!direction) return;
    switch (direction) {
      case "forward":
        return {
          x: 0,
          y: -HALF_SIZE,
          z: -HALF_SIZE,
        };
      case "backward":
        return {
          x: 0,
          y: -HALF_SIZE,
          z: HALF_SIZE,
        };
      case "left":
        return {
          x: HALF_SIZE,
          y: -HALF_SIZE,
          z: 0,
        };
      case "right":
        return {
          x: -HALF_SIZE,
          y: -HALF_SIZE,
          z: 0,
        };
    }
  }
  return { rollRolly };
}

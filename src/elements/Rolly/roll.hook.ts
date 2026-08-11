import type { GameInfos } from "@/scenes/Game/game.types";
import { type RefObject, useEffect, useRef } from "react";
import type { RollDirection } from "./rolly.types";
import {
  type Group,
  MathUtils,
  Vector3,
  Quaternion,
  type Vector3Tuple,
} from "three";
import type { AxisType } from "@/scenes/Game/game.types";

interface RollState {
  isAnimating: boolean;
  axis: AxisType | null;
  direction: RollDirection | null;
  targetRotation: {
    x: number | null;
    z: number | null;
  };
  targetPosition: {
    x: number | null;
    z: number | null;
  };
  
}

export function useRoll(
  gameInfos: RefObject<GameInfos>,
  refs: {
    pivotRef: RefObject<Group>;
    visualRef: RefObject<Group>;
    rollyRef: RefObject<Group>;
  },
) {
  const { visualRef, pivotRef, rollyRef } = refs;
  const HALF_SIZE = 1;
  const rollState = useRef<RollState>({
    isAnimating: false,
    axis: null,
    direction: null,
    targetRotation: {
      x: null,
      z: null,
    },
    targetPosition: {
      x: null,
      z: null,
    },
  });

  function rollRolly(delta: number) {
    console.log(rollyRef.current.position, gameInfos.current.rolly.edgeCenters)
    if (!pivotRef.current) return;

    const game = gameInfos.current;
    const state = rollState.current;


  }

  function setPivot(){

  }

  function getTargetDirection(): RollDirection {
    const axis = gameInfos.current.board.leanAxis;
    if (!axis) return;

    if (axis === "x")
      return gameInfos.current.board.rotation.x > 0 ? "backward" : "forward";
    else return gameInfos.current.board.rotation.z > 0 ? "left" : "right";
  }

  function getPivotOffset(direction: RollDirection) {
    if (!direction) return;
    switch (direction) {
      case "forward":
        return {
          offsetX: 0,
          offsetY: -HALF_SIZE,
          offsetZ: -HALF_SIZE,
        };
      case "backward":
        return {
          offsetX: 0,
          offsetY: -HALF_SIZE,
          offsetZ: HALF_SIZE,
        };
      case "left":
        return {
          offsetX: -HALF_SIZE,
          offsetY: -HALF_SIZE,
          offsetZ: 0,
        };
      case "right":
        return {
          offsetX: HALF_SIZE,
          offsetY: -HALF_SIZE,
          offsetZ: 0,
        };
    }
  }
  return { rollRolly };
}

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
  // targetRotation: {
  //   x: number | null;
  //   z: number | null;
  // };
  targetQuaternion: Quaternion | null;
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
  const rollState = useRef<RollState>({
    isAnimating: false,
    axis: null,
    direction: null,
    // targetRotation: {
    //   x: null,
    //   z: null,
    // },
    targetQuaternion: null,
    targetPosition: {
      x: null,
      z: null,
    },
  });

  function rollRolly(delta: number) {
    // console.log(rollyRef.current.position, gameInfos.current.rolly.edgeCenters);
    if (!pivotRef.current) return;
    const state = rollState.current;

    const game = gameInfos.current;

    if (state.isAnimating) {
      rollingRolly(delta, 10);
      return;
    }

    if (game.rolly.actualPlace.type !== "board") return;
    if (!game.board.isLeaning) return;

    const axis = game.board.leanAxis;
    const direction = getTargetDirection();
    if (!axis || !direction) return;

    initialiseRolling(axis, direction);
  }

  function finishRolling() {
    const state = rollState.current;

    const axis = state.axis;

    if (!axis) return;

    replacePivot();
    snapPosition(axis);

    gameInfos.current.rolly.isRolling = false;

    state.isAnimating = false;
    state.axis = null;
    state.direction = null;

    gameInfos.current.rolly.position = {
      x: rollyRef.current.position.x,
      y: rollyRef.current.position.y,
      z: rollyRef.current.position.z,
    };

    state.targetQuaternion = null;

    state.targetPosition = {
      x: null,
      z: null,
    };
  }

  function snapPosition(axis: AxisType) {
    // if (axis === "x") {
    //   rollyRef.current.position.x = rollState.current.targetPosition.x;
    // } else {
    //   rollyRef.current.position.z = rollState.current.targetPosition.z;
    // }
  }

  // function rollingRolly(delta: number, speed: number) {
  //   const state = rollState.current;

  //   if (!state.isAnimating) return;

  //   const axis = state.axis;
  //   if (!axis) return;

  //   const target = state.targetQuaternion;

  //   if (axis === "x" && target.x !== null) {
  //     pivotRef.current.rotation.x = MathUtils.lerp(
  //       pivotRef.current.rotation.x,
  //       target.x,
  //       delta * speed,
  //     );

  //     if (Math.abs(pivotRef.current.rotation.x - target.x) < 0.01) {
  //       pivotRef.current.rotation.x = target.x;
  //       finishRolling();
  //       return;
  //     }
  //   }

  //   if (axis === "z" && target.z !== null) {
  //     pivotRef.current.rotation.z = MathUtils.lerp(
  //       pivotRef.current.rotation.z,
  //       target.z,
  //       delta * speed,
  //     );

  //     if (Math.abs(pivotRef.current.rotation.z - target.z) < 0.01) {
  //       pivotRef.current.rotation.z = target.z;
  //       finishRolling();
  //       return;
  //     }
  //   }

  //   gameInfos.current.rolly.quaternion = pivotRef.current.quaternion.clone();
  // }
  function rollingRolly(delta: number, speed: number) {
    const state = rollState.current;

    if (!state.isAnimating) return;

    const target = state.targetQuaternion;

    if (!target) return;

    const pivot = pivotRef.current;

    pivot.quaternion.slerp(target, delta * speed);

    if (pivot.quaternion.angleTo(target) < 0.01) {
      pivot.quaternion.copy(target);
      finishRolling();
      gameInfos.current.rolly.quaternion = pivotRef.current.quaternion ? pivotRef.current.quaternion.clone() : null;
      return;
    }
    gameInfos.current.rolly.quaternion = pivotRef.current.quaternion ? pivotRef.current.quaternion.clone() : null;
  }

  function createTargetRotation(axis: Vector3, angle: number) {
    const state = rollState.current;
    const pivot = pivotRef.current;

    const rotation = new Quaternion().setFromAxisAngle(axis, angle);

    state.targetQuaternion = pivot.quaternion.clone().premultiply(rotation);
  }

  function initialiseRolling(axis: AxisType, direction: RollDirection) {
    const state = rollState.current;
    if (state.isAnimating) return;

    console.log("test");

    state.axis = axis;
    state.direction = direction;
    setPivot();

    const currentQuaternion = gameInfos.current.rolly.quaternion ? gameInfos.current.rolly.quaternion.clone() : null;

    state.isAnimating = true;

    state.targetQuaternion = currentQuaternion;

    switch (direction) {
      case "backward":
        // state.targetRotation.x += Math.PI / 2;
        createTargetRotation(new Vector3(1, 0, 0), Math.PI / 2);
        state.targetPosition.z = gameInfos.current.rolly.position.z - 2;
        state.targetPosition.x = gameInfos.current.rolly.position.x;
        break;

      case "forward":
        // state.targetRotation.x -= Math.PI / 2;
        createTargetRotation(new Vector3(1, 0, 0), -Math.PI / 2);
        state.targetPosition.z = gameInfos.current.rolly.position.z + 2;
        state.targetPosition.x = gameInfos.current.rolly.position.x;
        break;

      case "right":
        // state.targetRotation.z += Math.PI / 2;
        createTargetRotation(new Vector3(0, 0, 1), Math.PI / 2);
        state.targetPosition.x = gameInfos.current.rolly.position.x - 2;
        state.targetPosition.z = gameInfos.current.rolly.position.z;
        break;

      case "left":
        // state.targetRotation.z -= Math.PI / 2;
        createTargetRotation(new Vector3(0, 0, 1), -Math.PI / 2);
        state.targetPosition.x = gameInfos.current.rolly.position.x + 2;
        state.targetPosition.z = gameInfos.current.rolly.position.z;
        break;
    }

    gameInfos.current.rolly.isRolling = true;
  }

  function replacePivot() {
    const pivot = pivotRef.current;
    const mesh = visualRef.current;
    pivot.position.x = 0;
    pivot.position.y = 0;
    pivot.position.z = 0;
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;
  }

  function setPivot() {
    const state = rollState.current;
    const pivot = pivotRef.current;
    const mesh = visualRef.current;

    const { offsetX, offsetY, offsetZ } = getPivotOffset(state.direction);
    pivot.position.x = offsetX;
    pivot.position.y = offsetY;
    pivot.position.z = offsetZ;
    mesh.position.x = -offsetX;
    mesh.position.y = -offsetY;
    mesh.position.z = -offsetZ;
  }

  function getTargetDirection(): RollDirection {
    const axis = gameInfos.current.board.leanAxis;
    if (!axis) return;

    if (axis === "x")
      return gameInfos.current.board.rotation.x > 0 ? "backward" : "forward";
    else return gameInfos.current.board.rotation.z > 0 ? "left" : "right";
  }

  function getPivotOffset(direction: RollDirection) {
    const game = gameInfos.current;
    if (!direction) return;
    return {
      offsetX: game.rolly.edgeCenters[direction].x,
      offsetY: game.rolly.edgeCenters[direction].y,
      offsetZ: game.rolly.edgeCenters[direction].z,
    };
  }
  return { rollRolly };
}

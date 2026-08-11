import type { GameInfos } from "@/scenes/Game/game.types";
import { type RefObject, useEffect, useRef } from "react";
import type { RollDirection } from "./rolly.types";
import { type Group, MathUtils, Vector3, Quaternion } from "three";
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

  function setOffset(offsetX: number, offsetY: number, offsetZ: number) {
    const pivot = pivotRef.current;
    const visual = visualRef.current;

    pivot.position.set(offsetX, offsetY, offsetZ);

    const compensation = new Vector3(-offsetX, -offsetY, -offsetZ);

    const inverseRotation = pivot.quaternion.clone().invert();

    compensation.applyQuaternion(inverseRotation);

    visual.position.copy(compensation);
  }

  function startRolling(axis: AxisType, direction: RollDirection) {
    const state = rollState.current;
    if (state.isAnimating) return;
    const { offsetX, offsetY, offsetZ } = getPivotOffset(direction);

    setOffset(offsetX, offsetY, offsetZ);

    state.axis = axis;
    state.direction = direction;
    state.isAnimating = true;

    const currentRotation = gameInfos.current.rolly.rotation;

    state.targetRotation = {
      x: currentRotation.x,
      z: currentRotation.z,
    };

    switch (direction) {
      case "backward":
        state.targetRotation.x += Math.PI / 2;
        state.targetPosition.z = gameInfos.current.rolly.position.z - 2;
        state.targetPosition.x = gameInfos.current.rolly.position.x;
        break;

      case "forward":
        state.targetRotation.x -= Math.PI / 2;
        state.targetPosition.z = gameInfos.current.rolly.position.z + 2;
        state.targetPosition.x = gameInfos.current.rolly.position.x;
        break;

      case "right":
        state.targetRotation.z += Math.PI / 2;
        state.targetPosition.x = gameInfos.current.rolly.position.x - 2;
        state.targetPosition.z = gameInfos.current.rolly.position.z;
        break;

      case "left":
        state.targetRotation.z -= Math.PI / 2;
        state.targetPosition.x = gameInfos.current.rolly.position.x + 2;
        state.targetPosition.z = gameInfos.current.rolly.position.z;
        break;
    }

    gameInfos.current.rolly.isRolling = true;
  }

  function replaceOffset(axis: AxisType) {
    // if (
    //   gameInfos.current.rolly.position.x ===
    //     rollState.current.targetPosition.x &&
    //   gameInfos.current.rolly.position.z === rollState.current.targetPosition.z
    // )
    //   return;
    if (axis === "x") {
      rollyRef.current.position.x = rollState.current.targetPosition.x;
    } else {
      rollyRef.current.position.z = rollState.current.targetPosition.z;
    }
    pivotRef.current.position.x = 0;
    pivotRef.current.position.y = 0;
    pivotRef.current.position.z = 0;
    visualRef.current.position.x = 0;
    visualRef.current.position.y = 0;
    visualRef.current.position.z = 0;
    // pivotRef.current.position.x = rollyRef.current.position.x;
    // pivotRef.current.position.y = rollyRef.current.position.y;
    // pivotRef.current.position.z = rollyRef.current.position.z;
    // visualRef.current.position.x = rollyRef.current.position.x;
    // visualRef.current.position.y = rollyRef.current.position.y;
    // visualRef.current.position.z = rollyRef.current.position.z;
    gameInfos.current.rolly.position = {
      x: rollyRef.current.position.x,
      y: rollyRef.current.position.y,
      z: rollyRef.current.position.z,
    };
    rollState.current.targetRotation = {
      x: null,
      z: null,
    };
    rollState.current.targetPosition = {
      x: null,
      z: null,
    };
  }

  function finishRolling() {
    const state = rollState.current;

    const axis = state.axis;

    if (!axis) return;

    replaceOffset(axis);

    gameInfos.current.rolly.isRolling = false;

    state.isAnimating = false;
    state.axis = null;
    state.direction = null;

    state.targetRotation = {
      x: null,
      z: null,
    };

    state.targetPosition = {
      x: null,
      z: null,
    };
  }

  function rollingRolly(delta: number, speed: number) {
    const state = rollState.current;

    if (!state.isAnimating) return;

    const axis = state.axis;
    if (!axis) return;

    const target = state.targetRotation;

    if (axis === "x" && target.x !== null) {
      pivotRef.current.rotation.x = MathUtils.lerp(
        pivotRef.current.rotation.x,
        target.x,
        delta * speed,
      );

      if (Math.abs(pivotRef.current.rotation.x - target.x) < 0.01) {
        pivotRef.current.rotation.x = target.x;
        finishRolling();
        return;
      }
    }

    if (axis === "z" && target.z !== null) {
      pivotRef.current.rotation.z = MathUtils.lerp(
        pivotRef.current.rotation.z,
        target.z,
        delta * speed,
      );

      if (Math.abs(pivotRef.current.rotation.z - target.z) < 0.01) {
        pivotRef.current.rotation.z = target.z;
        finishRolling();
        return;
      }
    }

    gameInfos.current.rolly.rotation = {
      x: pivotRef.current.rotation.x,
      z: pivotRef.current.rotation.z,
    };
  }

  function rollRolly(delta: number) {
    if (!pivotRef.current) return;

    const game = gameInfos.current;
    const state = rollState.current;

    if (state.isAnimating) {
      rollingRolly(delta, 10);
      return;
    }
    if (game.rolly.actualPlace.type !== "board") {
      return;
    }
    if (!game.board.isLeaning) {
      return;
    }

    const axis = game.board.leanAxis;
    const direction = getTargetDirection();

    if (!axis || !direction) return;

    startRolling(axis, direction);
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

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
  canStartAnimation: boolean;
  // targetQuaternion: Quaternion | null;
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
  const rollState = useRef<RollState>({
    isAnimating: false,
    canStartAnimation: true,
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

  function canRoll(axis: AxisType, rotation: { x: number; z: number }) {
    if (axis === "x") return Math.abs(rotation.x) > 0.3 ? true : false;
    else return Math.abs(rotation.z) > 0.2 ? true : false;
  }

  function getRollSpeed() {
    const board = gameInfos.current.board;
    const axis = board.leanAxis;

      const MIN_ROLL_SPEED = 2;
      const MAX_ROLL_SPEED = 70;

    if (!axis) return 0;

    const angle =
      axis === "x" ? Math.abs(board.rotation.x) : Math.abs(board.rotation.z);

    const minAngle = Math.PI / 12; // 15°
    const maxAngle = Math.PI / 3; // 60°

    const t = MathUtils.clamp((angle - minAngle) / (maxAngle - minAngle), 0, 1);

    return MathUtils.lerp(MIN_ROLL_SPEED, MAX_ROLL_SPEED, t);
  }

  function rollRolly(delta: number) {
    const game = gameInfos.current;
    if (game.rolly.actualPlace.type !== "board") return;
    if (!pivotRef.current) return;

    const state = rollState.current;

    if (game.board.isLeaning && state.canStartAnimation && !state.isAnimating) {
      const axis = game.board.leanAxis;
      if (!canRoll(axis, game.board.rotation)) return;
      const direction = getTargetDirection();
      if (!axis || !direction) return;
      state.axis = axis;
      state.direction = direction;
      setTargetRotation();
      setPivot();
      state.canStartAnimation = false;
      state.isAnimating = true;
      return;
    }

    if (state.isAnimating) {
      rollingRolly(delta, getRollSpeed());
      return;
    }
  }

  function rollingRolly(delta: number, speed: number) {
    const state = rollState.current;
    const pivot = pivotRef.current;

    if (!state.isAnimating) return;
    if (!state.axis || !state.direction) return;

    const target = state.targetRotation;
    const axis = state.axis;

    if (axis === "x" && target.x !== null) {
      // pivotRef.current.rotation.x = MathUtils.lerp(
      //   pivotRef.current.rotation.x,
      //   target.x,
      //   delta * speed,
      // );

      pivot.rotation.x = MathUtils.damp(
        pivot.rotation.x,
        target.x,
        speed,
        delta,
      );

      if (Math.abs(pivotRef.current.rotation.x - target.x) < 0.001) {
        pivotRef.current.rotation.x = target.x;
        gameInfos.current.rolly.rotation = {
          x: gameInfos.current.rolly.rotation.x + pivotRef.current.rotation.x,
          z: gameInfos.current.rolly.rotation.z,
        };
        finishRolling();
        return;
      }
    }

    if (axis === "z" && target.z !== null) {
      // pivotRef.current.rotation.z = MathUtils.lerp(
      //   pivotRef.current.rotation.z,
      //   target.z,
      //   delta * speed,
      // );

      pivot.rotation.z = MathUtils.damp(
        pivot.rotation.z,
        target.z,
        speed,
        delta,
      );

      if (Math.abs(pivotRef.current.rotation.z - target.z) < 0.001) {
        pivotRef.current.rotation.z = target.z;
        gameInfos.current.rolly.rotation = {
          x: gameInfos.current.rolly.rotation.x,
          z: gameInfos.current.rolly.rotation.z + pivotRef.current.rotation.z,
        };
        finishRolling();
        return;
      }
    }
  }

  function snapPosition(axis: AxisType) {
    if (axis === "x") {
      rollyRef.current.position.x = rollState.current.targetPosition.x;
    } else {
      rollyRef.current.position.z = rollState.current.targetPosition.z;
    }
  }

  function finishRolling() {
    const state = rollState.current;

    const axis = state.axis;

    if (!axis) return;

    replacePivot();
    snapPosition(axis);

    gameInfos.current.rolly.isRolling = false;

    state.isAnimating = false;
    state.canStartAnimation = true;
    state.axis = null;
    state.direction = null;

    gameInfos.current.rolly.position = {
      x: rollyRef.current.position.x,
      y: rollyRef.current.position.y,
      z: rollyRef.current.position.z,
    };

    state.targetRotation = {
      x: null,
      z: null,
    };

    state.targetPosition = {
      x: null,
      z: null,
    };
  }

  function createTargetRotation(direction: RollDirection) {
    const state = rollState.current;

    switch (direction) {
      case "backward":
        state.targetRotation.x = Math.PI / 2;
        break;

      case "forward":
        state.targetRotation.x = -Math.PI / 2;
        break;

      case "right":
        state.targetRotation.z = -Math.PI / 2;
        break;

      case "left":
        state.targetRotation.z = Math.PI / 2;
        break;
    }
  }

  function setTargetRotation() {
    const state = rollState.current;
    if (state.isAnimating) return;

    const direction = state.direction;

    switch (direction) {
      case "backward":
        createTargetRotation(direction);
        state.targetPosition.z = gameInfos.current.rolly.position.z + 1;
        state.targetPosition.x = gameInfos.current.rolly.position.x;
        break;

      case "forward":
        createTargetRotation(direction);
        state.targetPosition.z = gameInfos.current.rolly.position.z - 1;
        state.targetPosition.x = gameInfos.current.rolly.position.x;
        break;

      case "right":
        createTargetRotation(direction);
        state.targetPosition.x = gameInfos.current.rolly.position.x + 1;
        state.targetPosition.z = gameInfos.current.rolly.position.z;
        break;

      case "left":
        createTargetRotation(direction);
        state.targetPosition.x = gameInfos.current.rolly.position.x - 1;
        state.targetPosition.z = gameInfos.current.rolly.position.z;
        break;
    }

    gameInfos.current.rolly.isRolling = true;
  }

  function replacePivot() {
    const pivot = pivotRef.current;
    const visual = visualRef.current;
    const rolly = rollyRef.current;
    const state = rollState.current;

    visual.rotation.x = gameInfos.current.rolly.rotation.x;
    visual.rotation.z = gameInfos.current.rolly.rotation.z;

    pivot.rotation.x = 0;
    pivot.rotation.z = 0;

    rolly.position.x = state.targetPosition.x;
    rolly.position.z = state.targetPosition.z;
    pivot.position.x = 0;
    pivot.position.y = 0;
    pivot.position.z = 0;
    visual.position.x = 0;
    visual.position.y = 0;
    visual.position.z = 0;
  }

  function setPivot() {
    const state = rollState.current;
    const pivot = pivotRef.current;
    const visual = visualRef.current;

    if (!state.direction) return;

    const { offsetX, offsetY, offsetZ } = getPivotOffset(state.direction);
    pivot.position.x = offsetX;
    pivot.position.y = offsetY;
    pivot.position.z = offsetZ;
    visual.position.x = -offsetX;
    visual.position.y = -offsetY;
    visual.position.z = -offsetZ;
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
    console.log("test");
    return {
      offsetX: game.rolly.edgeCenters[direction].x,
      offsetY: game.rolly.edgeCenters[direction].y,
      offsetZ: game.rolly.edgeCenters[direction].z,
    };
  }
  return { rollRolly };
}

import type { GameInfos } from "@/scenes/Game/game.types";
import { type RefObject, useEffect, useRef } from "react";
import type { RollDirection } from "./rolly.types";
import {
  type Group,
  MathUtils,
  Vector3,
  type Mesh,
  Quaternion,
  type Vector3Tuple,
} from "three";
import type { AxisType } from "@/scenes/Game/game.types";
import { colorTile } from "../Board/color-tile.utils";

interface RollState {
  isAnimating: boolean;
  axis: AxisType | null;
  direction: RollDirection | null;
  canStartAnimation: boolean;
  tileId: number | null;
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
    visualBoardRef: RefObject<Group>;
    visualWorldRef: RefObject<Group>;
    rollyRef: RefObject<Group>;
    tileRefs: RefObject<Map<number, Mesh>>;
  },
) {
  const { visualBoardRef, visualWorldRef, pivotRef, rollyRef, tileRefs } = refs;
  const rollState = useRef<RollState>({
    isAnimating: false,
    canStartAnimation: true,
    axis: null,
    direction: null,
    tileId: null,
    targetRotation: {
      x: null,
      z: null,
    },
    targetPosition: {
      x: null,
      z: null,
    },
  });

  function getActualTile() {
    const tiles = gameInfos.current.board.tiles.grid;
    const tileId =
      Object.keys(tiles).find(
        (tileId) =>
          tiles[tileId].position.x === rollyRef.current.position.x &&
          tiles[tileId].position.z === rollyRef.current.position.z,
      ) ?? null;
    return tileId ? Number(tileId) : null;
  }

  function canRoll(axis: AxisType, rotation: { x: number; z: number }) {
    if (axis === "x") return Math.abs(rotation.x) > 0.3 ? true : false;
    else return Math.abs(rotation.z) > 0.2 ? true : false;
  }

  function getRollSpeed() {
    const board = gameInfos.current.board;
    const axis = board.leanAxis;

    const MIN_ROLL_SPEED = 5;
    const MAX_ROLL_SPEED = 70;

    if (!axis) return MIN_ROLL_SPEED;

    const angle =
      axis === "x" ? Math.abs(board.rotation.x) : Math.abs(board.rotation.z);

    const minAngle = Math.PI / 12; // 15°
    const maxAngle = Math.PI / 3; // 60°

    const t = MathUtils.clamp((angle - minAngle) / (maxAngle - minAngle), 0, 1);

    return MathUtils.lerp(MIN_ROLL_SPEED, MAX_ROLL_SPEED, t);
  }

  function rollRolly(delta: number) {
    if (gameInfos.current.rolly.actualPlace.type !== "board") return;
    startRolling();
    rollingRolly(delta);
  }

  function snapRotation(angle: number) {
    const quarterTurn = Math.PI / 2;
    return Math.round(angle / quarterTurn) * quarterTurn;
  }

  function startRolling() {
    if (
      !gameInfos.current.board.isLeaning ||
      !rollState.current.canStartAnimation ||
      rollState.current.isAnimating
    )
      return;
    const axis = gameInfos.current.board.leanAxis;
    if (!canRoll(axis, gameInfos.current.board.rotation)) return;
    const direction = getTargetDirection();
    if (!axis || !direction) return;
    rollState.current.axis = axis;
    rollState.current.direction = direction;
    setTargetRotation();
    setPivot();
    rollState.current.canStartAnimation = false;
    rollState.current.isAnimating = true;
  }

  function rotateRolly(target: number, speed: number, delta: number) {
    const axis = rollState.current.axis;
    if (!axis) return;
    pivotRef.current.rotation[axis] = MathUtils.damp(
      pivotRef.current.rotation[axis],
      target,
      speed,
      delta,
    );

    if (Math.abs(pivotRef.current.rotation[axis] - target) < 0.001) {
      pivotRef.current.rotation[axis] = target;
      const newRotation = visualBoardRef.current.rotation[axis] + target;
      gameInfos.current.rolly.rotation[axis] = snapRotation(newRotation);
      finishRolling();
    }
  }

  function rollingRolly(delta: number) {
    if (!rollState.current.isAnimating) return;
    if (!rollState.current.axis || !rollState.current.direction) return;
    const speed = getRollSpeed();

    const target = rollState.current.targetRotation;
    const axis = rollState.current.axis;

    if (axis === "x" && target.x !== null) rotateRolly(target.x, speed, delta);
    if (axis === "z" && target.z !== null) rotateRolly(target.z, speed, delta);
  }

  function finishRolling() {
    const axis = rollState.current.axis;
    if (!axis) return;

    applyFinalRotation();
    resetPivot();
    applyFinalPosition();
    resetRollState();
    highlightCurrentTile();
  }

  function applyFinalRotation() {
    const rotation = gameInfos.current.rolly.rotation;

    visualBoardRef.current.rotation.x = rotation.x;
    visualBoardRef.current.rotation.z = rotation.z;

    visualWorldRef.current.rotation.x = rotation.x;
    visualWorldRef.current.rotation.z = rotation.z;
  }

  function resetPivot() {
    pivotRef.current.rotation.set(0, 0, 0);
    pivotRef.current.position.set(0, 0, 0);
  }

  function applyFinalPosition() {
    const { targetPosition } = rollState.current;

    rollyRef.current.position.x = targetPosition.x;
    rollyRef.current.position.z = targetPosition.z;

    visualBoardRef.current.position.set(0, 0, 0);

    gameInfos.current.rolly.position = {
      x: rollyRef.current.position.x,
      y: rollyRef.current.position.y,
      z: rollyRef.current.position.z,
    };
  }

  function resetRollState() {
    gameInfos.current.rolly.isRolling = false;

    rollState.current.isAnimating = false;
    rollState.current.canStartAnimation = true;
    rollState.current.axis = null;
    rollState.current.direction = null;

    rollState.current.targetRotation.x = null;
    rollState.current.targetRotation.z = null;

    rollState.current.targetPosition.x = null;
    rollState.current.targetPosition.z = null;
  }

  function highlightCurrentTile() {
    const tileId = getActualTile();
    rollState.current.tileId = tileId;

    if (!tileId) return;
    colorTile(tileId, tileRefs, gameInfos);
  }

  function createTargetRotation(direction: RollDirection) {
    switch (direction) {
      case "backward":
        rollState.current.targetRotation.x = Math.PI / 2;
        break;

      case "forward":
        rollState.current.targetRotation.x = -Math.PI / 2;
        break;

      case "right":
        rollState.current.targetRotation.z = -Math.PI / 2;
        break;

      case "left":
        rollState.current.targetRotation.z = Math.PI / 2;
        break;
    }
  }

  function setTargetRotation() {
    if (rollState.current.isAnimating) return;

    const direction = rollState.current.direction;

    switch (direction) {
      case "backward":
        createTargetRotation(direction);
        rollState.current.targetPosition.z =
          gameInfos.current.rolly.position.z + 1;
        rollState.current.targetPosition.x = gameInfos.current.rolly.position.x;
        break;

      case "forward":
        createTargetRotation(direction);
        rollState.current.targetPosition.z =
          gameInfos.current.rolly.position.z - 1;
        rollState.current.targetPosition.x = gameInfos.current.rolly.position.x;
        break;

      case "right":
        createTargetRotation(direction);
        rollState.current.targetPosition.x =
          gameInfos.current.rolly.position.x + 1;
        rollState.current.targetPosition.z = gameInfos.current.rolly.position.z;
        break;

      case "left":
        createTargetRotation(direction);
        rollState.current.targetPosition.x =
          gameInfos.current.rolly.position.x - 1;
        rollState.current.targetPosition.z = gameInfos.current.rolly.position.z;
        break;
    }

    gameInfos.current.rolly.isRolling = true;
  }

  function replacePivot() {
    visualBoardRef.current.rotation.x = gameInfos.current.rolly.rotation.x;
    visualBoardRef.current.rotation.z = gameInfos.current.rolly.rotation.z;
    visualWorldRef.current.rotation.x = gameInfos.current.rolly.rotation.x;
    visualWorldRef.current.rotation.z = gameInfos.current.rolly.rotation.z;

    pivotRef.current.rotation.x = 0;
    pivotRef.current.rotation.z = 0;

    rollyRef.current.position.x = rollState.current.targetPosition.x;
    rollyRef.current.position.z = rollState.current.targetPosition.z;
    pivotRef.current.position.x = 0;
    pivotRef.current.position.y = 0;
    pivotRef.current.position.z = 0;
    visualBoardRef.current.position.x = 0;
    visualBoardRef.current.position.y = 0;
    visualBoardRef.current.position.z = 0;
  }

  function setPivot() {
    if (!rollState.current.direction) return;

    const { offsetX, offsetY, offsetZ } = getPivotOffset(
      rollState.current.direction,
    );

    pivotRef.current.position.x = offsetX;
    pivotRef.current.position.y = offsetY;
    pivotRef.current.position.z = offsetZ;
    visualBoardRef.current.position.x = -offsetX;
    visualBoardRef.current.position.y = -offsetY;
    visualBoardRef.current.position.z = -offsetZ;
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
    return {
      offsetX: gameInfos.current.rolly.edgeCenters[direction].x,
      offsetY: gameInfos.current.rolly.edgeCenters[direction].y,
      offsetZ: gameInfos.current.rolly.edgeCenters[direction].z,
    };
  }
  return { rollRolly };
}

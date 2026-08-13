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
  rollSpeed: number;
}

export function useRoll(
  gameInfos: RefObject<GameInfos>,
  refs: {
    pivotRef: RefObject<Group>;
    visualBoardRef: RefObject<Group>;
    visualWorldRef: RefObject<Group>;
    rollyBoardRef: RefObject<Group>;
    rollyWorldRef: RefObject<Group>;
    tileRefs: RefObject<Map<number, Mesh>>;
  },
) {
  const {
    visualBoardRef,
    visualWorldRef,
    pivotRef,
    rollyBoardRef,
    rollyWorldRef,
    tileRefs,
  } = refs;
  const identityQuaternion = useRef(new Quaternion());
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
    rollSpeed: 0,
  });
  const velocityY = useRef(0);
  const velocityOut = useRef(0);
  const canReset = useRef(false);
  const isWaintingForReset = useRef(false);

  function getTileAtPosition(x: number, z: number): number | null {
    const tiles = gameInfos.current.board.tiles.grid;

    const EPSILON = 0.001;

    const tileId = Object.entries(tiles).find(
      ([, tile]) =>
        Math.abs(tile.position.x - x) < EPSILON &&
        Math.abs(tile.position.z - z) < EPSILON,
    )?.[0];

    return tileId !== undefined ? Number(tileId) : null;
  }

  function canRoll(axis: AxisType, rotation: { x: number; z: number }) {
    if (axis === "x") return Math.abs(rotation.x) > 0.3 ? true : false;
    else return Math.abs(rotation.z) > 0.2 ? true : false;
  }

  function getRollSpeed() {
    const board = gameInfos.current.board;
    const axis = board.leanAxis;

    const MIN_ROLL_SPEED = 5;
    const MAX_ROLL_SPEED = 200;

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
    rollState.current.tileId = getTargetTileId();
    rollState.current.canStartAnimation = false;
    rollState.current.isAnimating = true;
  }

  function getTargetTileId(): number | null {
    const { x, z } = rollState.current.targetPosition;

    if (x === null || z === null) {
      return null;
    }

    return getTileAtPosition(x, z);
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
      finishRolling();
    }
  }

  function fallRolly(delta: number) {
    if (!rollState.current.direction) return;
    if (gameInfos.current.rolly.actualPlace.type !== "void") return;
    if (isWaintingForReset.current) return;
    if (canReset.current) return;
    rollState.current.isAnimating = false;
    rollState.current.canStartAnimation = false;

    const distanceFromBoard = gameInfos.current.board.boardSize / 2 + 2;

    const axis =
      rollState.current.direction === "forward" ||
      rollState.current.direction === "backward"
        ? "z"
        : "x";

    const isNegative =
      rollState.current.direction === "forward" ||
      rollState.current.direction === "left";

    const direction = isNegative ? -1 : 1;

    // Sortie du plateau
    const target = distanceFromBoard * direction;

    // Accélération vers l'extérieur
    const acceleration = 200;
    const maxOutSpeed = 100;

    // Le mouvement horizontal + la chute commencent ensemble

    // Sortie du plateau
    velocityOut.current = Math.min(
      velocityOut.current + acceleration * delta,
      maxOutSpeed,
    );

    rollyBoardRef.current.position[axis] +=
      direction * velocityOut.current * delta;

    rollyBoardRef.current.rotation[rollState.current.axis] +=
      (delta * rollState.current.rollSpeed) / 10;

    // Récupère son orientation globale
    rollyBoardRef.current.getWorldQuaternion(rollyWorldRef.current.quaternion);

    // Ne jamais dépasser la distance voulue
    if (
      (direction === 1 && rollyBoardRef.current.position[axis] >= target) ||
      (direction === -1 && rollyBoardRef.current.position[axis] <= target)
    ) {
      rollyBoardRef.current.position[axis] = target;
      velocityOut.current = 0;
      gameInfos.current.rolly.isFalling = true;
    }

    // Chute en parallèle
    velocityY.current -= 9.81 * delta * 10;
    rollyWorldRef.current.position.y += velocityY.current * delta;

    // Limite de chute
    if (rollyWorldRef.current.position.y <= -300) {
      rollyWorldRef.current.position.y = -300;
      velocityY.current = 0;
      velocityOut.current = 0;
      canReset.current = true;
      setTimeout(() => {
        isWaintingForReset.current = true;
      }, 2000);
    }
  }

  function normalizeAngle(angle: number) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  function backToStart() {
    if (!isWaintingForReset.current || !canReset.current) return;
    rollState.current.canStartAnimation = true;

    gameInfos.current.rolly.actualPlace = {
      type: "start",
      id: null,
    };
    gameInfos.current.placeHovered = {
      type: "start",
      id: null,
    };
    gameInfos.current.rolly.isFalling = false;
    gameInfos.current.rolly.rotation = {
      x: 0,
      z: 0,
    };
    gameInfos.current.rolly.position = {
      x: gameInfos.current.start.positionX,
      y: 0.6,
      z: 0,
    };

    rollyWorldRef.current.position.set(
      gameInfos.current.start.positionX,
      0.6,
      0,
    );
    rollyBoardRef.current.position.set(
      gameInfos.current.start.positionX,
      0.6,
      0,
    );
    rollyBoardRef.current.rotation.set(0, 0, 0);
    rollyWorldRef.current.rotation.set(0, 0, 0);
    visualBoardRef.current.quaternion.identity();
    visualWorldRef.current.quaternion.identity();
    isWaintingForReset.current = false;
    canReset.current = false;
  }

  function resetRotationBucket(delta: number) {
    if (gameInfos.current.rolly.actualPlace.type !== "bucket") return;

    if (
      gameInfos.current.rolly.rotation.x === 0 &&
      gameInfos.current.rolly.rotation.z === 0
    )
      return;

    const t = MathUtils.clamp(delta * 10, 0, 1);

    visualWorldRef.current.quaternion.slerp(identityQuaternion.current, t);
    visualBoardRef.current.quaternion.copy(visualWorldRef.current.quaternion);

    if (
      visualWorldRef.current.quaternion.angleTo(identityQuaternion.current) <
      0.001
    ) {
      visualWorldRef.current.quaternion.identity();
      visualBoardRef.current.quaternion.identity();

      gameInfos.current.rolly.rotation = {
        x: 0,
        z: 0,
      };
    }
  }

  function rollingRolly(delta: number) {
    if (!rollState.current.isAnimating) return;
    if (!rollState.current.axis || !rollState.current.direction) return;
    rollState.current.rollSpeed = getRollSpeed();

    const target = rollState.current.targetRotation;
    const axis = rollState.current.axis;

    if (axis === "x" && target.x !== null)
      rotateRolly(target.x, rollState.current.rollSpeed, delta);
    if (axis === "z" && target.z !== null)
      rotateRolly(target.z, rollState.current.rollSpeed, delta);
  }

  function finishRolling() {
    const axis = rollState.current.axis;
    if (!axis) return;

    applyFinalRotation();
    resetPivot();
    colorCurrentTile();
    applyFinalPosition();
    resetRollState();
  }

  function applyFinalRotation() {
    const pivotQuaternion = new Quaternion().setFromEuler(
      pivotRef.current.rotation,
    );
    visualBoardRef.current.quaternion.premultiply(pivotQuaternion);
    visualWorldRef.current.quaternion.copy(visualBoardRef.current.quaternion);

    const euler = visualBoardRef.current.rotation;

    gameInfos.current.rolly.rotation.x = snapRotation(normalizeAngle(euler.x));
    gameInfos.current.rolly.rotation.z = snapRotation(normalizeAngle(euler.z));
  }

  function resetPivot() {
    pivotRef.current.rotation.set(0, 0, 0);
    pivotRef.current.position.set(0, 0, 0);
  }

  function applyFinalPosition() {
    const { targetPosition } = rollState.current;

    rollyBoardRef.current.position.x = targetPosition.x;
    rollyBoardRef.current.position.z = targetPosition.z;

    visualBoardRef.current.position.set(0, 0, 0);

    gameInfos.current.rolly.position = {
      x: rollyBoardRef.current.position.x,
      y: rollyBoardRef.current.position.y,
      z: rollyBoardRef.current.position.z,
    };
  }

  function resetRollState() {
    gameInfos.current.rolly.isRolling = false;

    rollState.current.isAnimating = false;
    rollState.current.canStartAnimation = true;

    rollState.current.targetRotation.x = null;
    rollState.current.targetRotation.z = null;

    rollState.current.targetPosition.x = null;
    rollState.current.targetPosition.z = null;
  }

  function colorCurrentTile() {
    const tileId = rollState.current.tileId;

    if (tileId) {
      const tileMesh = tileRefs.current.get(tileId);
      colorTile(tileId, tileMesh, gameInfos);
      gameInfos.current.rolly.actualPlace = {
        type: "board",
        id: rollState.current.tileId,
      };
      gameInfos.current.placeHovered = gameInfos.current.rolly.actualPlace;
    } else {
      gameInfos.current.rolly.actualPlace = {
        type: "void",
        id: null,
      };
      gameInfos.current.placeHovered = {
        type: null,
        id: null,
      };
    }
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
  return { rollRolly, fallRolly, backToStart, resetRotationBucket };
}

import type { GameInfos } from "@/Game/Scene/game.types";
import { useRef, type RefObject } from "react";
import { type Group, MathUtils, type Mesh, MeshStandardMaterial } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { BoardDragState } from "./board.types";

export function useBoard(
  gameInfos: RefObject<GameInfos>,
  refs: {
    boardRef: RefObject<Group>;
    tileRefs: RefObject<Map<number, Mesh>>;
  },
) {
  const { boardRef, tileRefs } = refs;

  const boardDrag = useRef<BoardDragState>({
    clientY: 0,
    startClientY: 0,
    borderId: 0,
    boardRotation: {
      x: 0,
      z: 0,
    },
  });

  function hoverTile(tileId: number | null) {
    if (!gameInfos.current.rolly.isDragging) return;

    const previousTileId =
      gameInfos.current.placeHovered.type === "board"
        ? gameInfos.current.placeHovered.id
        : null;

    // Retire l'émission de l'ancienne tile
    if (previousTileId !== null && previousTileId !== tileId) {
      const previousMesh = tileRefs.current.get(previousTileId);

      if (previousMesh) {
        const material = previousMesh.material;

        if (material instanceof MeshStandardMaterial) {
          material.emissive.set("#000000");
          material.emissiveIntensity = 0;
        }
      }
    }

    // Active l'émission de la nouvelle tile
    if (tileId !== null) {
      const tileMesh = tileRefs.current.get(tileId);

      if (tileMesh) {
        const material = tileMesh.material;

        if (material instanceof MeshStandardMaterial) {
          material.emissive.set("#ffffff");
          material.emissiveIntensity = 0.15;
        }
      }

      gameInfos.current.board.tiles.lastValidTileId = tileId;
    }

    gameInfos.current.placeHovered = {
      type: "board",
      id: tileId,
    };
  }

  function handlePointerEnter(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    document.body.style.cursor = "grab";
  }
  function handlePointerLeave(e: ThreeEvent<PointerEvent>) {
    if (gameInfos.current.grabbing !== null) return;
    e.stopPropagation();
    document.body.style.cursor = "default";
  }
  function handlePointerDown(e: ThreeEvent<PointerEvent>, borderId: number) {
    if (e.button !== 0) return;
    if (
      gameInfos.current.rolly.isDragging ||
      gameInfos.current.rolly.isFalling
    ) {
      return;
    }
    if (gameInfos.current.board.isLeaning) return;
    document.body.style.cursor = "grabbing";

    e.stopPropagation();

    boardDrag.current = {
      clientY: e.clientY,
      startClientY: e.clientY,
      borderId: borderId,
      boardRotation: {
        x: boardRef.current.rotation.x,
        z: boardRef.current.rotation.z,
      },
    };

    gameInfos.current.board.borders[borderId].isGrabbing = true;
    gameInfos.current.grabbing = "board";
  }

  function handlePointerUp() {
    if (gameInfos.current.rolly.isDragging) {
      return;
    }

    document.body.style.cursor = "default";

    gameInfos.current.board.borders = Object.fromEntries(
      Object.entries(gameInfos.current.board.borders).map(
        ([borderId, border]) => [
          borderId,
          {
            ...border,
            isGrabbing: false,
          },
        ],
      ),
    );
    gameInfos.current.grabbing = null;

    boardDrag.current.clientY = null;
    boardDrag.current.startClientY = null;
    boardDrag.current.borderId = null;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (gameInfos.current.grabbing !== "board") return;
    document.body.style.cursor = "grabbing";

    boardDrag.current.clientY = e.clientY;
  }

  function returnBoard(delta: number) {
    if (gameInfos.current.grabbing !== null) return;
    if (!gameInfos.current.board.isLeaning) return;

    const speed = 5;

    boardRef.current.rotation.x = MathUtils.damp(
      boardRef.current.rotation.x,
      0,
      speed,
      delta,
    );

    boardRef.current.rotation.z = MathUtils.damp(
      boardRef.current.rotation.z,
      0,
      speed,
      delta,
    );

    // Évite de rester avec des valeurs minuscules
    if (
      Math.abs(boardRef.current.rotation.x) < 0.001 &&
      Math.abs(boardRef.current.rotation.z) < 0.001
    ) {
      boardRef.current.rotation.x = 0;
      boardRef.current.rotation.z = 0;
      gameInfos.current.board.isLeaning = false;
      gameInfos.current.board.leanAxis = null;
    }
    gameInfos.current.board.rotation = {
      x: boardRef.current.rotation.x,
      z: boardRef.current.rotation.z,
    };
  }

  function leanBoard(delta: number) {
    if (gameInfos.current.grabbing !== "board") return;

    const { borderId, clientY, startClientY, boardRotation } =
      boardDrag.current;

    if (borderId === null || clientY === null || startClientY === null) {
      return;
    }

    const deltaY = clientY - startClientY;
    const maxAngle = Math.PI / 3;

    const isNegative = borderId === 1 || borderId === 3;
    const isX = borderId === 0 || borderId === 1;

    const direction = isNegative ? -1 : 1;

    const currentRotation = isX ? boardRotation.x : boardRotation.z;

    const targetRotation = MathUtils.clamp(
      currentRotation + deltaY * 0.01 * direction,
      -maxAngle,
      maxAngle,
    );

    const speed = 5;

    if (isX) {
      boardRef.current.rotation.x = MathUtils.damp(
        boardRef.current.rotation.x,
        targetRotation,
        speed,
        delta,
      );

      boardRef.current.rotation.x = MathUtils.clamp(
        boardRef.current.rotation.x,
        -maxAngle,
        maxAngle,
      );
      gameInfos.current.board.leanAxis = "x";
    } else {
      boardRef.current.rotation.z = MathUtils.damp(
        boardRef.current.rotation.z,
        targetRotation,
        speed,
        delta,
      );

      boardRef.current.rotation.z = MathUtils.clamp(
        boardRef.current.rotation.z,
        -maxAngle,
        maxAngle,
      );
      gameInfos.current.board.leanAxis = "z";
    }

    gameInfos.current.board.isLeaning = true;
    gameInfos.current.board.rotation = {
      x: boardRef.current.rotation.x,
      z: boardRef.current.rotation.z,
    };
  }

  return {
    hoverTile,
    board: {
      animations: {
        leanBoard,
        returnBoard,
      },
      interactions: {
        handlePointerMove,
        handlePointerDown,
        handlePointerUp,
        handlePointerEnter,
        handlePointerLeave,
      },
    },
  };
}

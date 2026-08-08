import type { GameInfos } from "@/scenes/Game/game.types";
import { type SetStateAction, type Dispatch, useRef, useState } from "react";
import { type Group, MathUtils, type Mesh } from "three";
import type { ThreeEvent } from "@react-three/fiber";

interface BoardDragState {
  clientY: number;
  startClientY: number;
  borderId: number;
  boardRotation: {
    x: number;
    z: number;
  };
}

export function useBoard(
  gameInfos: GameInfos,
  setGameInfos: Dispatch<SetStateAction<GameInfos>>,
) {
  const boardRef = useRef<Group>(null);
  const tileRefs = useRef<Map<number, Mesh>>(new Map());

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
    if (!gameInfos.rolly.isDragging) return;
    setGameInfos((prev) => ({
      ...prev,
      tileHovered: {
        type: "board",
        id: tileId,
      },
    }));
    // console.log(gameInfos.tileHovered.id)

    if (tileId !== null) {
      setGameInfos((prev) => ({
        ...prev,
        board: {
          ...prev.board,
          tiles: {
            ...prev.board.tiles,
            lastValidTileId: tileId,
          },
        },
        // tileHovered: {
        //   type: "board",
        //   id: tileId,
        // },
      }));
    }
  }
  function handlePointerEnter(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    document.body.style.cursor = "grab";
  }
  function handlePointerLeave(e: ThreeEvent<PointerEvent>) {
    if (gameInfos.grabbing !== null) return;
    e.stopPropagation();
    document.body.style.cursor = "default";
  }
  function handlePointerDown(e: ThreeEvent<PointerEvent>, borderId: number) {
    if (e.button !== 0) return;
    if (gameInfos.rolly.isDragging || gameInfos.rolly.isFalling) {
      return;
    }
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

    setGameInfos((prev) => ({
      ...prev,
      board: {
        ...prev.board,
        borders: {
          ...prev.board.borders,
          [borderId]: {
            isGrabbing: true,
          },
        },
      },
      grabbing: "board",
    }));
  }

  function handlePointerUp() {
    if (gameInfos.rolly.isDragging || gameInfos.rolly.isFalling) {
      return;
    }
    document.body.style.cursor = "default";

    setGameInfos((prev) => ({
      ...prev,
      board: {
        ...prev.board,
        borders: Object.fromEntries(
          Object.entries(prev.board.borders).map(([borderId, border]) => [
            borderId,
            {
              ...border,
              isGrabbing: false,
            },
          ]),
        ),
      },
      grabbing: null,
    }));

    boardDrag.current = {
      ...boardDrag.current,
      clientY: null,
      startClientY: null,
      borderId: null,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (gameInfos.grabbing !== "board") return;
    document.body.style.cursor = "grabbing";

    boardDrag.current.clientY = e.clientY;
  }

  function returnBoard(delta: number) {
    if (gameInfos.grabbing !== null) return;

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
    }
  }

  function leanBoard(delta: number) {
    if (gameInfos.grabbing !== "board") return;

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
    }
  }

  return {
    boardRef,
    tileRefs,
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

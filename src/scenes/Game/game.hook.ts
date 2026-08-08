import { useState, useRef } from "react";
import type { GameInfos } from "./game.types";
import type { TileInfosType } from "@/elements/Board/board.types";
import { type Mesh, type Group, MathUtils, type Vector3Tuple } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { createBoard } from "@/elements/Board/utils/create-board.utils";

interface RollyDragState {
  targetTile: {
    tileId: number | null;
    infos: TileInfosType | null;
  };
  targetPosition: Vector3Tuple | null;
  lastValidTileId: number | null;
}

interface BoardDragState {
  clientY: number;
  startClientY: number;
  borderId: number;
  boardRotation: {
    x: number;
    z: number;
  };
}

export function useGame() {
  const tileRefs = useRef<Map<number, Mesh>>(new Map());
  const boardRef = useRef<Group>(null);
  const rollyRef = useRef<Group>(null);
  const [tileHovered, setTileHovered] = useState<null | number>(null);
  const [gameInfos, setGameInfos] = useState<GameInfos>({
    state: "playing",
    board: createBoard(12),
    rolly: {
      color: "#ffe920",
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      isDragging: false,
      isFalling: false,
    },
    buckets: {
      bucket1: {
        position: 1,
        color: "red",
      },
      bucket2: {
        position: 2,
        color: "blue",
      },
      bucket3: {
        position: 3,
        color: "yellow",
      },
      bucket4: {
        position: 4,
        color: "green",
      },
    },
    grabbing: null,
  });

  const rollyDrag = useRef<RollyDragState>({
    targetTile: {
      tileId: null,
      infos: null,
    },
    targetPosition: null,
    lastValidTileId: null,
  });

  const boardDrag = useRef<BoardDragState>({
    clientY: 0,
    startClientY: 0,
    borderId: 0,
    boardRotation: {
      x: 0,
      z: 0,
    },
  });

  function resetGame() {
    setGameInfos({
      state: "startscreen",
      board: {
        boardSize: 8,
        tiles: {},
        borders: {},
      },
      rolly: {
        color: "#ffe920",
        position: {
          x: 0,
          y: 0,
          z: 0,
        },
        isDragging: false,
        isFalling: false,
      },
      buckets: {
        bucket1: {
          position: 1,
          color: "red",
        },
        bucket2: {
          position: 2,
          color: "blue",
        },
        bucket3: {
          position: 3,
          color: "yellow",
        },
        bucket4: {
          position: 4,
          color: "green",
        },
      },
      grabbing: null,
    });
  }

  function hoverTile(tileId: number | null) {
    if (!gameInfos.rolly.isDragging) return;
    setTileHovered(tileId);

    if (tileId !== null) {
      rollyDrag.current.lastValidTileId = tileId;
    }
  }
  function handleRollyPointerDown(e: ThreeEvent<PointerEvent>) {
    if (gameInfos.rolly.isDragging || gameInfos.rolly.isFalling) return;
    e.stopPropagation();
    document.body.style.cursor = "grabbing";
    setGameInfos((prev) => ({
      ...prev,
      rolly: {
        ...prev.rolly,
        position: {
          x: rollyRef.current.position.x,
          y: rollyRef.current.position.y,
          z: rollyRef.current.position.z,
        },
        isDragging: true,
      },
      grabbing: "rolly",
    }));
  }
  function rollyPointerUp() {
    if (!gameInfos.rolly.isDragging) return;
    const lastTileId = rollyDrag.current.lastValidTileId;
    document.body.style.cursor = "default";

    if (lastTileId === null) {
      rollyDrag.current.targetPosition = [
        gameInfos.rolly.position.x,
        gameInfos.rolly.position.y,
        gameInfos.rolly.position.z,
      ];
      setGameInfos((prev) => ({
        ...prev,
        rolly: {
          ...prev.rolly,
          isDragging: false,
          isFalling: true,
        },
      }));
      return;
    }

    const tile = gameInfos.board.tiles[lastTileId];

    rollyDrag.current.targetPosition = [
      tile.position.x,
      rollyRef.current.position.y,
      tile.position.z,
    ];

    setGameInfos((prev) => ({
      ...prev,
      rolly: {
        ...prev.rolly,
        position: {
          x: tile.position.x,
          y: prev.rolly.position.y,
          z: tile.position.z,
        },
        isDragging: false,
        isFalling: true,
      },
    }));
  }

  function handleRollyPointerEnter(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    document.body.style.cursor = "grab";
  }
  function handleRollyPointerLeave(e: ThreeEvent<PointerEvent>) {
    if (gameInfos.rolly.isDragging) return;
    e.stopPropagation();
    document.body.style.cursor = "default";
  }

  function snapRolly(delta: number) {
    if (!rollyDrag.current.targetPosition) return;

    const [targetX, , targetZ] = rollyDrag.current.targetPosition;

    if (
      rollyRef.current.position.x === targetX &&
      rollyRef.current.position.y === 0.6 &&
      rollyRef.current.position.z === targetZ
    )
      return;

    rollyRef.current.position.x = MathUtils.lerp(
      rollyRef.current.position.x,
      targetX,
      delta * 10,
    );

    rollyRef.current.position.z = MathUtils.lerp(
      rollyRef.current.position.z,
      targetZ,
      delta * 10,
    );

    rollyRef.current.position.y = MathUtils.lerp(
      rollyRef.current.position.y,
      0.6,
      delta * 10,
    );

    const distance = Math.sqrt(
      (rollyRef.current.position.x - targetX) ** 2 +
        (rollyRef.current.position.y - 0.6) ** 2 +
        (rollyRef.current.position.z - targetZ) ** 2,
    );

    if (distance < 0.01) {
      // Force la position exacte
      rollyRef.current.position.x = targetX;
      rollyRef.current.position.y = 0.6;
      rollyRef.current.position.z = targetZ;

      rollyDrag.current.targetPosition = null;

      setGameInfos((prev) => ({
        ...prev,
        board: {
          ...prev.board,
          tiles: {
            ...prev.board.tiles,
            [rollyDrag.current.targetTile.tileId]: {
              ...prev.board.tiles[rollyDrag.current.targetTile.tileId],
              color: gameInfos.rolly.color,
            },
          },
        },
        rolly: {
          ...prev.rolly,
          isFalling: false,
        },
      }));
    }
  }

  function dragRolly(delta: number) {
    if (!gameInfos.rolly.isDragging) return;
    const tileId = tileHovered ?? rollyDrag.current.lastValidTileId;
    if (tileId === null) return;

    rollyDrag.current.targetTile = {
      tileId: tileId,
      infos: gameInfos.board.tiles[tileId],
    };

    rollyRef.current.position.x = MathUtils.lerp(
      rollyRef.current.position.x,
      rollyDrag.current.targetTile.infos.position.x,
      delta * 10,
    );

    rollyRef.current.position.z = MathUtils.lerp(
      rollyRef.current.position.z,
      rollyDrag.current.targetTile.infos.position.z,
      delta * 10,
    );

    rollyRef.current.position.y = MathUtils.lerp(
      rollyRef.current.position.y,
      3,
      delta * 10,
    );
  }

  function handleBorderPointerDown(
    e: ThreeEvent<PointerEvent>,
    borderId: number,
  ) {
    if (
      gameInfos.rolly.isDragging ||
      gameInfos.rolly.isFalling ||
      rollyDrag.current.targetPosition
    ) {
      return;
    }

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

  function borderPointerUp() {
    if (
      gameInfos.rolly.isDragging ||
      gameInfos.rolly.isFalling ||
      rollyDrag.current.targetPosition
    ) {
      return;
    }

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

  // function handleBoardPointerMove(e: ThreeEvent<PointerEvent>) {
  //   if (gameInfos.grabbing !== "board") return;

  //   boardDrag.current.clientY = e.clientY;
  // }
  function handleBoardPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (gameInfos.grabbing !== "board") return;

    boardDrag.current.clientY = e.clientY;
  }

  function returnBoard(delta: number) {
    const allBordersReleased = Object.values(gameInfos.board.borders).every(
      (border) => !border.isGrabbing,
    );

    if (!allBordersReleased) return;
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

  function handlePointerUp() {
    rollyPointerUp();
    borderPointerUp();
    setGameInfos((prev) => ({
      ...prev,
      grabbing: null,
    }));
  }

  return {
    tileHovered,
    gameInfos,
    hoverTile,
    tileRefs,
    resetGame,
    rollyRef,
    boardRef,
    animations: {
      rolly: {
        snapRolly,
        dragRolly,
      },
      board: {
        leanBoard,
        returnBoard,
      },
    },
    interactions: {
      canvas: {
        handleBoardPointerMove,
        handlePointerUp,
      },
      rolly: {
        handleRollyPointerDown,
        handleRollyPointerLeave,
        handleRollyPointerEnter,
      },
      board: {
        handleBorderPointerDown,
      },
    },
  };
}

export function useRolly(){}

export function useBoard(){}
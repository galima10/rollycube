import { useState, useRef } from "react";
import type { GameInfos } from "./game.types";
import type { TileInfosType, BoardType } from "@/elements/Board/board.types";
import { type Mesh, type Group, MathUtils, Vector3Tuple } from "three";
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

export function useGame() {
  const tileRefs = useRef<Map<number, Mesh>>(new Map());
  const rollyRef = useRef<Group>(null);
  const [tileHovered, setTileHovered] = useState<null | number>(null);
  const [gameInfos, setGameInfos] = useState<GameInfos>({
    state: "playing",
    board: createBoard(8),
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
  });

  const rollyDrag = useRef<RollyDragState>({
    targetTile: {
      tileId: null,
      infos: null,
    },
    targetPosition: null,
    lastValidTileId: null,
  });

  function resetGame() {
    setGameInfos({
      state: "startscreen",
      board: {
        boardSize: 8,
        tiles: {},
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
    }));
  }
  function handleRollyPointerUp() {
    if (!gameInfos.rolly.isDragging) return;
    const lastTileId = rollyDrag.current.lastValidTileId;

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

  return {
    tileHovered,
    gameInfos,
    hoverTile,
    tileRefs,
    resetGame,
    handleRollyPointerDown,
    handleRollyPointerUp,
    rollyRef,
    animations: {
      rolly: {
        snapRolly,
        dragRolly,
      },
    },
  };
}

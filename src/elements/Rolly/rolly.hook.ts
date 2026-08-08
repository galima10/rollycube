import type { GameInfos } from "@/scenes/Game/game.types";
import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { type Group, type Vector3Tuple, MathUtils } from "three";
import type { TileInfosType } from "../Board/board.types";

interface RollyDragState {
  targetTile: {
    tileId: number | null;
    infos: TileInfosType | null;
  };
  targetPosition: Vector3Tuple | null;
}

export function useRolly(
  gameInfos: GameInfos,
  setGameInfos: Dispatch<SetStateAction<GameInfos>>,
) {
  const rollyRef = useRef<Group>(null);

  const rollyDrag = useRef<RollyDragState>({
    targetTile: {
      tileId: null,
      infos: null,
    },
    targetPosition: null,
  });

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (e.button !== 0) return;
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
  function handlePointerUp() {
    if (!gameInfos.rolly.isDragging) return;
    const lastTileId = gameInfos.board.tiles.lastValidTileId;
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
        grabbing: null,
      }));
      return;
    }

    const tile = gameInfos.board.tiles.grid[lastTileId];

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
      grabbing: null,
    }));
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
            grid: {
              ...prev.board.tiles.grid,
              [rollyDrag.current.targetTile.tileId]: {
                ...prev.board.tiles.grid[rollyDrag.current.targetTile.tileId],
                color: gameInfos.rolly.color,
              },
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
    const tileId =
      gameInfos.board.tiles.tileHovered ??
      gameInfos.board.tiles.lastValidTileId;
    if (tileId === null) return;

    rollyDrag.current.targetTile = {
      tileId: tileId,
      infos: gameInfos.board.tiles.grid[tileId],
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
    rollyRef,
    rolly: {
      animations: {
        dragRolly,
        snapRolly,
      },
      interactions: {
        handlePointerDown,
        handlePointerEnter,
        handlePointerLeave,
        handlePointerUp,
      },
    },
  };
}

import type { GameInfos } from "@/scenes/Game/game.types";
import { type Dispatch, type SetStateAction, useRef, useEffect } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import {
  type Group,
  type Vector3Tuple,
  MathUtils,
  Vector3,
  type Mesh,
} from "three";
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
  const rollyBoardRef = useRef<Group>(null);
  const rollyWorldRef = useRef<Group>(null);

  const worldPosition = new Vector3();
  const isRollyWorld = useRef(true);

  const rollyDrag = useRef<RollyDragState>({
    targetTile: {
      tileId: null,
      infos: null,
    },
    targetPosition: null,
  });

  function syncRollyWorldToRollyBoard() {
    if (!rollyBoardRef.current || !rollyWorldRef.current) return;
    if (
      gameInfos.rolly.actualPlace.type === "start" &&
      rollyBoardRef.current.position.y === 0.6
    ) {
      isRollyWorld.current = true;
      return;
    }

    isRollyWorld.current = false;

    rollyBoardRef.current.getWorldPosition(worldPosition);
    rollyWorldRef.current.position.copy(worldPosition);
  }

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
          x: rollyBoardRef.current.position.x,
          y: rollyBoardRef.current.position.y,
          z: rollyBoardRef.current.position.z,
        },
        isDragging: true,
      },
      grabbing: "rolly",
    }));
  }

  function pointerUp(
    type: "start" | "insideBoard" | "outsideBoard",
    position: { x: number; y: number; z: number } | null,
  ) {
    if (position) {
      rollyDrag.current.targetPosition = [position.x, position.y, position.z];
    }

    setGameInfos((prev) => {
      if (type === "outsideBoard") {
        return {
          ...prev,
          rolly: {
            ...prev.rolly,
            isDragging: false,
            isFalling: true,
          },
          grabbing: null,
        };
      }

      return {
        ...prev,
        rolly: {
          ...prev.rolly,
          position: {
            x: position.x,
            y: position.y,
            z: position.z,
          },
          isDragging: false,
          isFalling: true,
        },
        grabbing: null,
      };
    });
  }

  function handlePointerUp() {
    if (!gameInfos.rolly.isDragging) return;
    document.body.style.cursor = "default";

    if (gameInfos.placeHovered.type === "board") {
      const lastTileId = gameInfos.board.tiles.lastValidTileId;

      if (lastTileId === null) {
        pointerUp("outsideBoard", {
          x: gameInfos.rolly.position.x,
          y: gameInfos.rolly.position.y,
          z: gameInfos.rolly.position.z,
        });
        return;
      }

      const tile = gameInfos.board.tiles.grid[lastTileId];

      pointerUp("insideBoard", {
        x: tile.position.x,
        y: 0.6,
        z: tile.position.z,
      });
    } else if (gameInfos.placeHovered.type === "start") {
      console.log("test");
      pointerUp("start", {
        x: gameInfos.start.positionX,
        y: 0.6,
        z: 0,
      });
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

  function snapRolly(delta: number) {
    if (!rollyDrag.current.targetPosition) return;

    const [targetX, targetY, targetZ] = rollyDrag.current.targetPosition;

    moveRolly(delta, {
      x: targetX,
      y: targetY,
      z: targetZ,
    });

    rollySnapped(targetX, targetY, targetZ);
  }

  function rollySnapped(targetX: number, targetY: number, targetZ: number) {
    const distance = Math.sqrt(
      (rollyBoardRef.current.position.x - targetX) ** 2 +
        (rollyBoardRef.current.position.y - targetY) ** 2 +
        (rollyBoardRef.current.position.z - targetZ) ** 2,
    );

    if (distance >= 0.01) return;

    rollyBoardRef.current.position.set(targetX, targetY, targetZ);

    rollyDrag.current.targetPosition = null;

    setGameInfos((prev) => {
      if (gameInfos.placeHovered.type === "board") {
        return {
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
            actualPlace: {
              type: "board",
              id: rollyDrag.current.targetTile.tileId,
            },
          },
        };
      } else if (gameInfos.placeHovered.type === "start") {
        return {
          ...prev,
          rolly: {
            ...prev.rolly,
            isFalling: false,
            actualPlace: {
              type: "start",
              id: null,
            },
          },
        };
      }
    });
  }

  function dragRolly(delta: number) {
    if (!gameInfos.rolly.isDragging || gameInfos.grabbing !== "rolly") return;
    switch (gameInfos.placeHovered.type) {
      case "board":
        const tileId =
          gameInfos.placeHovered.id ?? gameInfos.board.tiles.lastValidTileId;

        if (tileId === null) return;

        rollyDrag.current.targetTile = {
          tileId: tileId,
          infos: gameInfos.board.tiles.grid[tileId],
        };

        moveRolly(delta, {
          x: rollyDrag.current.targetTile.infos.position.x,
          y: 3,
          z: rollyDrag.current.targetTile.infos.position.z,
        });

        break;

      case "start":
        rollyDrag.current.targetTile = {
          tileId: null,
          infos: {
            position: {
              x: gameInfos.start.positionX,
              z: 0,
            },
          },
        };

        moveRolly(delta, {
          x: rollyDrag.current.targetTile.infos.position.x,
          y: 3,
          z: rollyDrag.current.targetTile.infos.position.z,
        });

        break;

      case "bucket":
        break;
    }
  }

  function moveRolly(
    delta: number,
    target: { x: number; y: number; z: number },
  ) {
    rollyBoardRef.current.position.x = MathUtils.lerp(
      rollyBoardRef.current.position.x,
      target.x,
      delta * 10,
    );

    rollyBoardRef.current.position.z = MathUtils.lerp(
      rollyBoardRef.current.position.z,
      target.z,
      delta * 10,
    );

    rollyBoardRef.current.position.y = MathUtils.lerp(
      rollyBoardRef.current.position.y,
      target.y,
      delta * 10,
    );
  }

  return {
    rollyBoardRef,
    rollyWorldRef,
    isRollyWorld,
    rolly: {
      animations: {
        dragRolly,
        snapRolly,
        syncRollyWorldToRollyBoard,
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

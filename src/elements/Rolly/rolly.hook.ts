import type { GameInfos } from "@/scenes/Game/game.types";
import { type Dispatch, type SetStateAction, useRef } from "react";
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

  const startRef = useRef<Mesh>(null);

  const worldPosition = new Vector3();

  function syncRollyWorldToRollyBoard() {
    if (!rollyBoardRef.current || !rollyWorldRef.current) return;

    rollyBoardRef.current.getWorldPosition(worldPosition);

    rollyWorldRef.current.position.copy(worldPosition);
  }

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
          x: rollyBoardRef.current.position.x,
          y: rollyBoardRef.current.position.y,
          z: rollyBoardRef.current.position.z,
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
      rollyBoardRef.current.position.y,
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
      rollyBoardRef.current.position.x === targetX &&
      rollyBoardRef.current.position.y === 0.6 &&
      rollyBoardRef.current.position.z === targetZ
    )
      return;

    rollyBoardRef.current.position.x = MathUtils.lerp(
      rollyBoardRef.current.position.x,
      targetX,
      delta * 10,
    );

    rollyBoardRef.current.position.z = MathUtils.lerp(
      rollyBoardRef.current.position.z,
      targetZ,
      delta * 10,
    );

    rollyBoardRef.current.position.y = MathUtils.lerp(
      rollyBoardRef.current.position.y,
      0.6,
      delta * 10,
    );

    const distance = Math.sqrt(
      (rollyBoardRef.current.position.x - targetX) ** 2 +
        (rollyBoardRef.current.position.y - 0.6) ** 2 +
        (rollyBoardRef.current.position.z - targetZ) ** 2,
    );

    if (distance < 0.01) {
      // Force la position exacte
      rollyBoardRef.current.position.x = targetX;
      rollyBoardRef.current.position.y = 0.6;
      rollyBoardRef.current.position.z = targetZ;

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
      gameInfos.tileHovered.id ?? gameInfos.board.tiles.lastValidTileId;
    if (tileId === null) return;

    rollyDrag.current.targetTile = {
      tileId: tileId,
      infos: gameInfos.board.tiles.grid[tileId],
    };

    rollyBoardRef.current.position.x = MathUtils.lerp(
      rollyBoardRef.current.position.x,
      rollyDrag.current.targetTile.infos.position.x,
      delta * 10,
    );

    rollyBoardRef.current.position.z = MathUtils.lerp(
      rollyBoardRef.current.position.z,
      rollyDrag.current.targetTile.infos.position.z,
      delta * 10,
    );

    rollyBoardRef.current.position.y = MathUtils.lerp(
      rollyBoardRef.current.position.y,
      3,
      delta * 10,
    );
  }

  //   function dragRolly(delta: number) {
  //     if (!gameInfos.rolly.isDragging || gameInfos.grabbing !== "rolly") return;
  //     switch (gameInfos.tileHovered.type) {
  //       case "board":
  //         const tileId =
  //           gameInfos.tileHovered.id ?? gameInfos.board.tiles.lastValidTileId;

  //         if (tileId === null) return;

  //         rollyDrag.current.targetTile = {
  //           tileId: tileId,
  //           infos: gameInfos.board.tiles.grid[tileId],
  //         };

  //         break;

  //       case "start":
  //         rollyDrag.current.targetTile = {
  //           tileId: null,
  //           infos: {
  //             position: {
  //               x: startRef.current.position.x,
  //               z: startRef.current.position.z,
  //             },
  //           },
  //         };

  //         break;

  //       case "bucket":
  //         // récupérer bucketRef

  //         break;
  //     }

  //     rollyBoardRef.current.position.x = MathUtils.lerp(
  //       rollyBoardRef.current.position.x,
  //       rollyDrag.current.targetTile.infos.position.x,
  //       delta * 10,
  //     );

  //     rollyBoardRef.current.position.z = MathUtils.lerp(
  //       rollyBoardRef.current.position.z,
  //       rollyDrag.current.targetTile.infos.position.z,
  //       delta * 10,
  //     );

  //     rollyBoardRef.current.position.y = MathUtils.lerp(
  //       rollyBoardRef.current.position.y,
  //       3,
  //       delta * 10,
  //     );
  //   }
  return {
    rollyBoardRef,
    rollyWorldRef,
    startRef,
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

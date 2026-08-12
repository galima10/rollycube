import type { GameInfos } from "@/scenes/Game/game.types";
import { useRef, type RefObject } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import {
  type Group,
  MathUtils,
  Vector3,
  type Mesh,
  MeshStandardMaterial,
} from "three";
import type { RollyDragState } from "./rolly.types";
import { setColor } from "@/scenes/Game/set-color.utils";
import { colorTile } from "../Board/color-tile.utils";

export function useRolly(
  gameInfos: RefObject<GameInfos>,
  refs: {
    rollyBoardRef: RefObject<Group>;
    rollyWorldRef: RefObject<Group>;
    paintRollyBoardRef: RefObject<Mesh>;
    paintRollyWorldRef: RefObject<Mesh>;
    tileRefs: RefObject<Map<number, Mesh>>;
  },
) {
  const {
    rollyBoardRef,
    rollyWorldRef,
    paintRollyBoardRef,
    paintRollyWorldRef,
    tileRefs,
  } = refs;

  const worldPosition = new Vector3();

  const rollyDrag = useRef<RollyDragState>({
    targetPlace: {
      id: null,
      infos: null,
    },
    targetPosition: null,
  });

  function syncRollyWorldToRollyBoard() {
    if (!rollyBoardRef.current || !rollyWorldRef.current) return;
    if (
      gameInfos.current.rolly.actualPlace.type === "void" &&
      !gameInfos.current.rolly.isFalling
    ) {
      rollyBoardRef.current.visible = true;
      rollyWorldRef.current.visible = false;
      rollyBoardRef.current.getWorldPosition(worldPosition);
      rollyWorldRef.current.position.copy(worldPosition);
      return;
    }
    if (
      (gameInfos.current.rolly.actualPlace.type === "start" &&
        rollyBoardRef.current.position.y === 0.6) ||
      (gameInfos.current.rolly.actualPlace.type === "bucket" &&
        rollyBoardRef.current.position.y === 1) ||
      (gameInfos.current.rolly.actualPlace.type === "void" &&
        gameInfos.current.rolly.isFalling)
    ) {
      rollyBoardRef.current.visible = false;
      rollyWorldRef.current.visible = true;
      return;
    }

    rollyBoardRef.current.visible = true;
    rollyWorldRef.current.visible = false;

    rollyBoardRef.current.getWorldPosition(worldPosition);
    rollyWorldRef.current.position.copy(worldPosition);
  }

  function backToStart() {
    if (!gameInfos.current.rolly.isWaintingForReset) return;
    console.log("reset");
    gameInfos.current.rolly.actualPlace = {
      type: "start",
      id: null,
    };
    gameInfos.current.rolly.isFalling = false;

    rollyWorldRef.current.position.set(
      gameInfos.current.start.positionX,
      0.6,
      0,
    );
    rollyWorldRef.current.rotation.set(0, 0, 0);
    rollyBoardRef.current.rotation.set(0, 0, 0);

    gameInfos.current.rolly.isWaintingForReset = false;
  }

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (e.button !== 0) return;
    if (
      gameInfos.current.rolly.isDragging ||
      gameInfos.current.rolly.isUnGrabbing
    )
      return;
    if (gameInfos.current.board.isLeaning) return;
    if (gameInfos.current.rolly.actualPlace.type === "void") return;
    e.stopPropagation();
    document.body.style.cursor = "grabbing";

    gameInfos.current.rolly.position = {
      x: rollyBoardRef.current.position.x,
      y: rollyBoardRef.current.position.y,
      z: rollyBoardRef.current.position.z,
    };
    gameInfos.current.rolly.isDragging = true;
    gameInfos.current.grabbing = "rolly";
  }

  function pointerUp(
    type: "outside" | null,
    position: { x: number; y: number; z: number } | null,
  ) {
    if (position) {
      rollyDrag.current.targetPosition = [position.x, position.y, position.z];
    }

    if (type !== "outside")
      gameInfos.current.rolly.position = {
        x: position.x,
        y: position.y,
        z: position.z,
      };

    gameInfos.current.rolly.isDragging = false;
    gameInfos.current.rolly.isUnGrabbing = true;
    gameInfos.current.grabbing = null;
  }

  function handlePointerUp() {
    if (!gameInfos.current.rolly.isDragging) return;
    document.body.style.cursor = "default";

    if (gameInfos.current.placeHovered.type === "board") {
      const lastTileId = gameInfos.current.board.tiles.lastValidTileId;

      if (lastTileId === null) {
        pointerUp(null, {
          x: gameInfos.current.rolly.position.x,
          y: gameInfos.current.rolly.position.y,
          z: gameInfos.current.rolly.position.z,
        });
        return;
      }

      const tile = gameInfos.current.board.tiles.grid[lastTileId];

      pointerUp(null, {
        x: tile.position.x,
        y: 0.6,
        z: tile.position.z,
      });
    } else if (gameInfos.current.placeHovered.type === "start") {
      pointerUp(null, {
        x: gameInfos.current.start.positionX,
        y: 0.6,
        z: 0,
      });
    } else if (gameInfos.current.placeHovered.type === "bucket") {
      pointerUp(null, {
        x: gameInfos.current.buckets.positionX,
        y: 1,
        z: gameInfos.current.buckets.colors[rollyDrag.current.targetPlace.id]
          .positionZ,
      });
    }
  }

  function handlePointerEnter(e: ThreeEvent<PointerEvent>) {
    if (gameInfos.current.rolly.actualPlace.type === "void") return;
    e.stopPropagation();
    document.body.style.cursor = "grab";
  }
  function handlePointerLeave(e: ThreeEvent<PointerEvent>) {
    if (gameInfos.current.grabbing !== null) return;
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

    if (gameInfos.current.placeHovered.type === "board") {
      const tileId = rollyDrag.current.targetPlace.id;
      gameInfos.current.rolly.actualPlace = {
        type: "board",
        id: tileId,
      };
      colorTile(tileId, tileRefs, gameInfos);
    } else if (gameInfos.current.placeHovered.type === "start") {
      gameInfos.current.rolly.actualPlace = {
        type: "start",
        id: null,
      };
    } else if (gameInfos.current.placeHovered.type === "bucket") {
      const newColor =
        gameInfos.current.buckets.colors[rollyDrag.current.targetPlace.id]
          .color;
      gameInfos.current.rolly.actualPlace = {
        type: "bucket",
        id: rollyDrag.current.targetPlace.id,
      };
      gameInfos.current.rolly.color = newColor;

      setColor(newColor, paintRollyBoardRef.current);
      setColor(newColor, paintRollyWorldRef.current);
    }
    gameInfos.current.rolly.isUnGrabbing = false;
  }

  function dragRolly(delta: number) {
    if (
      !gameInfos.current.rolly.isDragging ||
      gameInfos.current.grabbing !== "rolly"
    )
      return;
    switch (gameInfos.current.placeHovered.type) {
      case "board":
        const tileId =
          gameInfos.current.placeHovered.id ??
          gameInfos.current.board.tiles.lastValidTileId;

        if (tileId === null) return;

        rollyDrag.current.targetPlace = {
          id: tileId,
          infos: gameInfos.current.board.tiles.grid[tileId],
        };

        moveRolly(delta, {
          x: rollyDrag.current.targetPlace.infos.position.x,
          y: 3,
          z: rollyDrag.current.targetPlace.infos.position.z,
        });

        break;

      case "start":
        rollyDrag.current.targetPlace = {
          id: null,
          infos: {
            position: {
              x: gameInfos.current.start.positionX,
              z: 0,
            },
          },
        };

        moveRolly(delta, {
          x: rollyDrag.current.targetPlace.infos.position.x,
          y: 3,
          z: rollyDrag.current.targetPlace.infos.position.z,
        });

        break;

      case "bucket":
        rollyDrag.current.targetPlace = {
          id: gameInfos.current.placeHovered.id,
          infos: {
            position: {
              x: gameInfos.current.buckets.positionX,
              z: gameInfos.current.buckets.colors[
                gameInfos.current.placeHovered.id
              ].positionZ,
            },
          },
        };

        moveRolly(delta, {
          x: rollyDrag.current.targetPlace.infos.position.x,
          y: 3,
          z: rollyDrag.current.targetPlace.infos.position.z,
        });
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
    rolly: {
      animations: {
        dragRolly,
        snapRolly,
        syncRollyWorldToRollyBoard,
        backToStart,
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

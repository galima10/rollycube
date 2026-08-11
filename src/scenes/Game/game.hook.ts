import { useRef, useEffect } from "react";
import type { GameInfos } from "./game.types";
import { createBoard } from "@/elements/Board/create-board.utils";
import type { Group, Mesh } from "three";

export function useGame() {
  const gameInfos = useRef<GameInfos>({
    state: "playing",
    board: createBoard(12),
    rolly: {
      color: "yellow",
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      isDragging: false,
      isFalling: false,
      actualPlace: {
        type: "start",
        id: null,
      },
      rotation: {
        x: 0,
        z: 0,
      },
      isRolling: false,
    },
    buckets: {
      positionX: 12 / 2 + 4,
      colors: {
        1: {
          bucketId: 1,
          positionZ: -4.5,
          color: "red",
        },
        2: {
          bucketId: 2,
          positionZ: -1.5,
          color: "blue",
        },
        3: {
          bucketId: 3,
          positionZ: 1.5,
          color: "green",
        },
        4: {
          bucketId: 4,
          positionZ: 4.5,
          color: "yellow",
        },
      },
    },
    grabbing: null,
    placeHovered: {
      type: "start",
      id: null,
    },
    start: {
      positionX: -(12 / 2 + 4),
    },
  });

  const rollyBoardRef = useRef<Group>(null);
  const rollyWorldRef = useRef<Group>(null);
  const paintRollyBoardRef = useRef<Mesh>(null);
  const paintRollyWorldRef = useRef<Mesh>(null);
  const rollyPivotRef = useRef<Group>(null);

  const boardRef = useRef<Group>(null);
  const tileRefs = useRef<Map<number, Mesh>>(new Map());

  const bucketsPaintRefs = useRef<Map<number, Mesh>>(new Map());

  return {
    gameInfos,
    refs: {
      rolly: {
        rollyBoardRef,
        rollyWorldRef,
        rollyPivotRef,
        paintRollyBoardRef,
        paintRollyWorldRef,
      },
      board: {
        boardRef,
        tileRefs,
      },
      buckets: {
        bucketsPaintRefs,
      },
    },
  };
}

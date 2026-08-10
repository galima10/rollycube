import { useState } from "react";
import type { GameInfos } from "./game.types";
import { createBoard } from "@/elements/Board/create-board.utils";

export function useGame() {
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
      actualPlace: {
        type: "start",
        id: null,
      },
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
    placeHovered: {
      type: "start",
      id: null,
    },
    start: {
      positionX: -(12 / 2 + 4),
    },
  });

  function resetGame() {
    setGameInfos({
      state: "startscreen",
      board: {
        boardSize: 8,
        tiles: {
          lastValidTileId: null,
          grid: {},
        },
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
        actualPlace: {
          type: null,
          id: null,
        },
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
      placeHovered: {
        type: "start",
        id: null,
      },
      start: {
        positionX: -(12 / 2 + 3),
      },
    });
  }

  return {
    gameInfos,
    resetGame,
    setGameInfos,
  };
}

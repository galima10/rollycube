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
      positionX: 12 / 2 + 4,
      bucket1: {
        position: {
          id: 1,
          z: -4.5,
        },
        color: "red",
      },
      bucket2: {
        position: {
          id: 2,
          z: -1.5,
        },
        color: "blue",
      },
      bucket3: {
        position: {
          id: 3,
          z: 1.5,
        },
        color: "green",
      },
      bucket4: {
        position: {
          id: 4,
          z: 4.5,
        },
        color: "yellow",
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
        positionX: 12 / 2 + 4,
        bucket1: {
          position: {
            id: 1,
            z: -6,
          },
          color: "red",
        },
        bucket2: {
          position: {
            id: 2,
            z: -2,
          },
          color: "blue",
        },
        bucket3: {
          position: {
            id: 3,
            z: 2,
          },
          color: "green",
        },
        bucket4: {
          position: {
            id: 4,
            z: 6,
          },
          color: "yellow",
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

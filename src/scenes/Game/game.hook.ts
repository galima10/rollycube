import { useState } from "react";
import type { GameInfos } from "./game.types";
import { createBoard } from "@/elements/Board/create-board.utils";

export function useGame() {
  const [gameInfos, setGameInfos] = useState<GameInfos>({
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

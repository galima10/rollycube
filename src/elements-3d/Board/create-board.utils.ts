import type { BoardSizeType, BoardType } from "./board.types";

export function createBoard(boardSize: BoardSizeType): BoardType {
  const tiles: BoardType["tiles"] = {
    lastValidTileId: null,
    grid: {},
  };

  for (let i = 0; i < boardSize * boardSize; i++) {
    const x = i % boardSize;
    const z = Math.floor(i / boardSize);

    tiles.grid[i] = {
      position: {
        x: x - boardSize / 2 + 0.5,
        z: z - boardSize / 2 + 0.5,
      },
      color: "#616365",
    };
  }

  const borders: BoardType["borders"] = {};
  for (let i = 0; i < 4; i++) {
    borders[i] = {
      isGrabbing: false,
    };
  }
  return {
    boardSize,
    tiles,
    borders,
    isLeaning: false,
    rotation: {
      x: 0,
      z: 0,
    },
    leanAxis: null,
    defaultTileColor: "#616365",
  };
}

import type { BoardSizeType, BoardType } from "../board.types";

export function createBoard(boardSize: BoardSizeType): BoardType {
  const tiles: BoardType["tiles"] = {};

  for (let i = 0; i < boardSize * boardSize; i++) {
    const x = i % boardSize;
    const z = Math.floor(i / boardSize);

    tiles[i] = {
      position: {
        x: x - boardSize / 2 + 0.5,
        z: z - boardSize / 2 + 0.5,
      },
      color: "#616365",
      selected: false,
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
  };
}

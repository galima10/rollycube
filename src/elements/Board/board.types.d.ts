export type BoardSizeType = 8 | 16 | 24 | 32;

export interface TileInfosType {
  position: {
    x: number;
    z: number;
  };
  color: string;
  selected: boolean;
}

export interface BoardType {
  boardSize: BoardSizeType;
  tiles: {
    [tileId: number]: TileInfosType;
  };
}

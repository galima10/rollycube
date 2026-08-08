export type BoardSizeType = 8 | 12;

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
  borders: {
    [borderId: number]: {
      isGrabbing: boolean;
    };
  };
}

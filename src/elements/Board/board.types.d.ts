export type BoardSizeType = 8 | 12;

export interface TileInfosType {
  position: {
    x: number;
    z: number;
  };
  color?: string;
}

export interface BoardType {
  boardSize: BoardSizeType;
  tiles: {
    lastValidTileId: number | null;
    grid: {
      [tileId: number]: TileInfosType;
    };
  };
  borders: {
    [borderId: number]: {
      isGrabbing: boolean;
    };
  };
  isLeaning: boolean;
  leanAxis: AxisType;
  rotation: {
    x: number;
    z: number;
  };
  defaultTileColor: string;
}

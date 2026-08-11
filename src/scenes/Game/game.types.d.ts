import type { BoardType } from "@/elements/Board/board.types";
import type { RollyType } from "@/elements/Rolly/rolly.types";
import type { BucketsType } from "@/elements/Bucket/bucket.types";
import type { StartType } from "@/elements/Start/start.types";

export type GameStateType =
  | "startscreen"
  | "boardchoice"
  | "playing"
  | "finish";

export type PlaceType =
  | {
      type: "board";
      id: number | null;
    }
  | {
      type: "start";
      id: null;
    }
  | {
      type: "bucket";
      id: number;
    }
  | {
      type: null;
      id: null;
    };

export interface GameInfos {
  state: GameStateType;
  board: BoardType;
  placeHovered: PlaceType;
  rolly: RollyType;
  buckets: BucketsType;
  grabbing: "rolly" | "board" | null;
  start: StartType;
}

export type AxisType = "x" | "z" | null;

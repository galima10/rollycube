import type { BoardType } from "@/elements/Board/board.types";
import type { RollyType } from "@/elements/Rolly/rolly.types";
import type { BucketType } from "@/elements/Bucket/bucket.types";

export type GameStateType =
  | "startscreen"
  | "boardchoice"
  | "playing"
  | "finish";

export interface GameInfos {
  state: GameStateType;
  board: BoardType;
  rolly: RollyType;
  buckets: {
    bucket1: BucketType;
    bucket2: BucketType;
    bucket3: BucketType;
    bucket4: BucketType;
  };
  grabbing: "rolly" | "board" | null;
}

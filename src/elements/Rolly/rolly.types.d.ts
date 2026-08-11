import type { Mesh, MeshStandardMaterial, Vector3, Quaternion } from "three";
import type { PlaceType } from "@/scenes/Game/game.types";

export type RollyGLTFResult = GLTF & {
  nodes: {
    Body: Mesh;
    Cube004: Mesh;
    Cube004_1: Mesh;
    Cube012: Mesh;
    Cube012_1: Mesh;
  };
  animations: GLTFAction[];
};

export interface RollyType {
  color: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  isDragging: boolean;
  isFalling: boolean;
  actualPlace: PlaceType;
  // rotation: {
  //   x: number;
  //   z: number;
  // };
  quaternion: Quaternion | null;
  isRolling: boolean;
  edgeCenters: {
    forward: Vector3 | null;
    backward: Vector3 | null;
    left: Vector3 | null;
    right: Vector3 | null;
  };
}

export interface RollyDragState {
  targetPlace: {
    id: number | null;
    infos: TileInfosType | null;
  };
  targetPosition: Vector3Tuple | null;
}

export type RollDirection = "left" | "right" | "forward" | "backward";

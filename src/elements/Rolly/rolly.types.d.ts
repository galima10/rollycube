import type { Mesh, MeshStandardMaterial, AnimationClip } from "three";
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
  rotation: {
    x: number;
    z: number;
  };
  isRolling: boolean;
}

export interface RollyDragState {
  targetPlace: {
    id: number | null;
    infos: TileInfosType | null;
  };
  targetPosition: Vector3Tuple | null;
}

export type RollDirection = "left" | "right" | "forward" | "backward";

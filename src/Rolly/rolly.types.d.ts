import type { Mesh, MeshStandardMaterial, AnimationClip } from "three";

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

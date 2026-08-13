export type BucketGLTFResult = GLTF & {
  nodes: {
    Cube009: THREE.Mesh;
    Cube009_1: THREE.Mesh;
    Paint: THREE.Mesh;
  };
  animations: GLTFAction[];
};

interface BucketType {
  bucketId: number;
  positionZ: number;
  color: string;
}

export interface BucketsType {
  positionX: number;
  colors: {
    [bucketId: number]: BucketType;
  };
}

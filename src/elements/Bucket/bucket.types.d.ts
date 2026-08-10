export type BucketGLTFResult = GLTF & {
  nodes: {
    Cube009: THREE.Mesh;
    Cube009_1: THREE.Mesh;
    Paint: THREE.Mesh;
  };
  animations: GLTFAction[];
};

interface BucketType {
  position: {
    id: 1 | 2 | 3 | 4;
    z: number;
  };
  color: string;
}

export interface BucketsType {
  positionX: number;
  bucket1: BucketType;
  bucket2: BucketType;
  bucket3: BucketType;
  bucket4: BucketType;
}

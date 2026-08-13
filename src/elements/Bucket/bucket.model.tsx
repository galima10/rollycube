import { useGLTF } from "@react-three/drei";
import { type ThreeElements, type ThreeEvent } from "@react-three/fiber";
import { BucketGLTFResult } from "./bucket.types";
import { getBucketMaterials } from "./bucket.materials";
import { useEffect, type RefObject } from "react";
import { type Mesh } from "three";
import type { GameInfos } from "@/Game/Scene/game.types";
import type { BucketType } from "./bucket.types";
import { setColor } from "@/Game/Scene/set-color.utils";

type BucketModelProps = ThreeElements["group"] & {
  bucketsPaintRefs: RefObject<Map<number, Mesh>>;
  bucketId: number;
  paintColor: string;
};

function BucketModel({
  bucketsPaintRefs,
  bucketId,
  paintColor,
  ...props
}: BucketModelProps) {
  const { nodes } = useGLTF(
    `${import.meta.env.BASE_URL}models/bucket.glb`,
  ) as BucketGLTFResult;
  const materials = getBucketMaterials();
  useEffect(() => {
    const bucketMesh = bucketsPaintRefs.current.get(bucketId);
    setColor(paintColor, bucketMesh);
  }, []);
  return (
    <group {...props} dispose={null}>
      <group rotation={[Math.PI, Math.PI / 2, Math.PI]} scale={0.75}>
        <mesh geometry={nodes.Cube009.geometry} material={materials.body} />
        <mesh geometry={nodes.Cube009_1.geometry} material={materials.handle} />
        <mesh
          geometry={nodes.Paint.geometry}
          ref={(mesh) => {
            if (mesh) bucketsPaintRefs.current.set(bucketId, mesh);
            else bucketsPaintRefs.current.delete(bucketId);
          }}
        >
          <meshStandardMaterial />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload("/bucket.glb");

type BucketsModelProps = ThreeElements["group"] & {
  gameInfos: RefObject<GameInfos>;
  buckets: {
    handlePointerEnter: (e: ThreeEvent<PointerEvent>, bucketId: number) => void;
  };
  bucketsPaintRefs: RefObject<Map<number, Mesh>>;
};

export default function BucketsModel({
  gameInfos,
  buckets,
  bucketsPaintRefs,
  ...props
}: BucketsModelProps) {
  return (
    <group
      {...props}
      dispose={null}
      position={[gameInfos.current.buckets.positionX, 0, 0]}
    >
      {(
        Object.entries(gameInfos.current.buckets.colors) as [
          string,
          BucketType,
        ][]
      ).map(([bucketId, bucket], index) => {
        return (
          <BucketModel
            key={index}
            position={[0, 0, bucket.positionZ]}
            onPointerEnter={(e) =>
              buckets.handlePointerEnter(e, Number(bucketId))
            }
            bucketId={Number(bucketId)}
            bucketsPaintRefs={bucketsPaintRefs}
            paintColor={bucket.color}
          />
        );
      })}
    </group>
  );
}

import { useGLTF } from "@react-three/drei";
import { type ThreeElements, type ThreeEvent } from "@react-three/fiber";
import { BucketGLTFResult } from "./bucket.types";
import { getBucketMaterials } from "./bucket.materials";
import { useMemo } from "react";
import { MeshLambertMaterial } from "three";
import type { GameInfos } from "@/scenes/Game/game.types";
import type { BucketType } from "./bucket.types";

type BucketModelProps = ThreeElements["group"] & {
  paintColor: string;
  isHovered: boolean;
};

function BucketModel({ paintColor, isHovered, ...props }: BucketModelProps) {
  const { nodes } = useGLTF(
    `${import.meta.env.BASE_URL}models/bucket.glb`,
  ) as BucketGLTFResult;
  const materials = getBucketMaterials();
  const paintMaterial = useMemo(
    () =>
      new MeshLambertMaterial({
        color: paintColor,
        emissive: isHovered ? "#ffffff" : "#000000",
        emissiveIntensity: isHovered ? 0.15 : 0,
      }),
    [paintColor, isHovered],
  );
  return (
    <group {...props} dispose={null}>
      <group rotation={[Math.PI, Math.PI / 2, Math.PI]} scale={0.75}>
        <mesh geometry={nodes.Cube009.geometry} material={materials.body} />
        <mesh geometry={nodes.Cube009_1.geometry} material={materials.handle} />
        <mesh geometry={nodes.Paint.geometry} material={paintMaterial} />
      </group>
    </group>
  );
}

useGLTF.preload("/bucket.glb");

type BucketsModelProps = ThreeElements["group"] & {
  gameInfos: GameInfos;
  buckets: {
    handlePointerEnter: (e: ThreeEvent<PointerEvent>, bucketId: number) => void;
  };
};

export default function BucketsModel({
  gameInfos,
  buckets,
  ...props
}: BucketsModelProps) {
  return (
    <group
      {...props}
      dispose={null}
      position={[gameInfos.buckets.positionX, 0, 0]}
    >
      {(Object.entries(gameInfos.buckets.colors) as [string, BucketType][]).map(
        ([bucketId, bucket], index) => {
          return (
            <BucketModel
              key={index}
              paintColor={bucket.color}
              position={[0, 0, bucket.positionZ]}
              onPointerEnter={(e) =>
                buckets.handlePointerEnter(e, Number(bucketId))
              }
              isHovered={
                gameInfos.grabbing === "rolly" &&
                gameInfos.placeHovered.type === "bucket" &&
                gameInfos.placeHovered.id === Number(bucketId)
              }
            />
          );
        },
      )}
    </group>
  );
}

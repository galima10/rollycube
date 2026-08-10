import { useGLTF } from "@react-three/drei";
import { ThreeElements } from "@react-three/fiber";
import { BucketGLTFResult } from "./bucket.types";
import { getBucketMaterials } from "./bucket.materials";
import { useMemo } from "react";
import { MeshLambertMaterial } from "three";
import type { GameInfos } from "@/scenes/Game/game.types";

type BucketModelProps = ThreeElements["group"] & {
  paintColor: string;
};

function BucketModel({ paintColor, ...props }: BucketModelProps) {
  const { nodes } = useGLTF(
    `${import.meta.env.BASE_URL}models/bucket.glb`,
  ) as BucketGLTFResult;
  const materials = getBucketMaterials();
  const paintMaterial = useMemo(
    () =>
      new MeshLambertMaterial({
        color: paintColor,
      }),
    [paintColor],
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
  gameInofs: GameInfos;
};

export default function BucketsModel({ gameInofs, ...props }: BucketsModelProps) {
  return (
    <group
      {...props}
      dispose={null}
      position={[gameInofs.buckets.positionX, 0, 0]}
    >
      <BucketModel
        paintColor={gameInofs.buckets.bucket1.color}
        position={[0, 0, gameInofs.buckets.bucket1.position.z]}
      />
      <BucketModel
        paintColor={gameInofs.buckets.bucket2.color}
        position={[0, 0, gameInofs.buckets.bucket2.position.z]}
      />
      <BucketModel
        paintColor={gameInofs.buckets.bucket3.color}
        position={[0, 0, gameInofs.buckets.bucket3.position.z]}
      />
      <BucketModel
        paintColor={gameInofs.buckets.bucket4.color}
        position={[0, 0, gameInofs.buckets.bucket4.position.z]}
      />
    </group>
  );
}

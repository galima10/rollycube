import { useGLTF } from "@react-three/drei";
import { ThreeElements } from "@react-three/fiber";
import { BucketGLTFResult } from "./bucket.types";
import { getBucketMaterials } from "./bucket.materials";
import { useMemo } from "react";
import { MeshLambertMaterial } from "three";

type BucketModelProps = ThreeElements["group"] & {
  paintColor: string;
};

export function BucketModel({ paintColor, ...props }: BucketModelProps) {
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
      <group rotation={[Math.PI, 0, Math.PI]} scale={1.5}>
        <mesh geometry={nodes.Cube009.geometry} material={materials.body} />
        <mesh geometry={nodes.Cube009_1.geometry} material={materials.handle} />
        <mesh geometry={nodes.Paint.geometry} material={paintMaterial} />
      </group>
    </group>
  );
}

useGLTF.preload("/bucket.glb");

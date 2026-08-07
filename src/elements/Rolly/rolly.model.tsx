import { useGLTF } from "@react-three/drei";
import type { RollyGLTFResult } from "./rolly.types";
import type { ThreeElements } from "@react-three/fiber";
import { getRollyMaterials } from "./rolly.materials";
import { MeshLambertMaterial } from "three";
import { useMemo } from "react";

type RollyModelProps = ThreeElements["group"] & {
  paintColor: string;
};

export function RollyModel({ paintColor, ...props }: RollyModelProps) {
  const { nodes } = useGLTF(
    `${import.meta.env.BASE_URL}models/rolly.glb`,
  ) as RollyGLTFResult;
  const materials = getRollyMaterials();
  const paintMaterial = useMemo(
    () =>
      new MeshLambertMaterial({
        color: paintColor,
      }),
    [paintColor],
  );
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Body.geometry}
        material={paintMaterial}
        rotation={[Math.PI, 0, Math.PI]}
      />
      <group
        position={[0.706, 0, 1]}
        rotation={[Math.PI, 0, Math.PI]}
        scale={[0.429, 0.429, 0.078]}
      >
        <mesh geometry={nodes.Cube004.geometry} material={materials.eye} />
        <mesh geometry={nodes.Cube004_1.geometry} material={materials.pupil} />
      </group>
      <group
        position={[-0.706, 0, 1]}
        rotation={[Math.PI, 0, Math.PI]}
        scale={[0.429, 0.429, 0.078]}
      >
        <mesh geometry={nodes.Cube012.geometry} material={materials.eye} />
        <mesh geometry={nodes.Cube012_1.geometry} material={materials.pupil} />
      </group>
    </group>
  );
}

useGLTF.preload("/rolly.glb");

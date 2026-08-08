import { useGLTF } from "@react-three/drei";
import type { RollyGLTFResult } from "./rolly.types";
import {
  type ThreeElements,
  useFrame,
  type ThreeEvent,
} from "@react-three/fiber";
import { getRollyMaterials } from "./rolly.materials";
import { MeshLambertMaterial, type Group } from "three";
import { useMemo, type RefObject } from "react";

type RollyModelProps = ThreeElements["group"] & {
  paintColor: string;
  rollyRef: RefObject<Group>;
  handleRollyPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  rolly: {
    dragRolly: (delta: number) => void;
    snapRolly: (delta: number) => void;
  };
};

export function RollyModel({
  paintColor,
  rollyRef,
  rolly,
  handleRollyPointerDown,
  ...props
}: RollyModelProps) {
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
  useFrame((_, delta) => {
    rolly.dragRolly(delta);
    rolly.snapRolly(delta);
  });
  return (
    <group
      {...props}
      dispose={null}
      ref={rollyRef}
      onPointerDown={handleRollyPointerDown}
    >
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

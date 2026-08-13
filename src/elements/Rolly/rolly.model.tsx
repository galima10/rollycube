import { useGLTF } from "@react-three/drei";
import type { RollyGLTFResult } from "./rolly.types";
import {
  type ThreeElements,
  useFrame,
  type ThreeEvent,
} from "@react-three/fiber";
import { getRollyMaterials } from "./rolly.materials";
import { type Group, type Mesh } from "three";
import { useEffect, type RefObject } from "react";
import { setColor } from "@/scenes/Game/set-color.utils";

type RollyModelProps = ThreeElements["group"] & {
  paintColor: string;
  rollyRef: RefObject<Group>;
  paintRef: RefObject<Mesh>;
  rollyPivotRef?: RefObject<Group>;
  rollyVisualRef?: RefObject<Group>;
  rolly: {
    animations: {
      dragRolly?: (delta: number) => void;
      snapRolly?: (delta: number) => void;
      syncRollyWorldToRollyBoard?: () => void;
      rollRolly?: (delta: number) => void;
      fallRolly?: (delta: number) => void;
      backToStart?: () => void;
      resetRotationBucket?: (delta: number) => void
    };
    interactions?: {
      handlePointerDown?: (e: ThreeEvent<PointerEvent>) => void;
      handlePointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
      handlePointerEnter?: (e: ThreeEvent<PointerEvent>) => void;
    };
  };
};

export default function RollyModel({
  paintColor,
  rollyRef,
  paintRef,
  rollyPivotRef,
  rollyVisualRef,
  rolly,
  ...props
}: RollyModelProps) {
  const { nodes } = useGLTF(
    `${import.meta.env.BASE_URL}models/rolly.glb`,
  ) as RollyGLTFResult;
  const materials = getRollyMaterials();
  useFrame((_, delta) => {
    rolly.animations.dragRolly?.(delta);
    rolly.animations.snapRolly?.(delta);
    rolly.animations.rollRolly?.(delta);
    rolly.animations.syncRollyWorldToRollyBoard?.();
    rolly.animations.fallRolly?.(delta);
    rolly.animations.backToStart?.();
    rolly.animations.resetRotationBucket?.(delta);
  });
  useEffect(() => {
    setColor(paintColor, paintRef.current);
  }, []);
  return (
    <group {...props} ref={rollyRef}>
      <group ref={rollyPivotRef}>
        <group
          dispose={null}
          ref={rollyVisualRef}
          onPointerDown={rolly.interactions?.handlePointerDown}
          onPointerEnter={rolly.interactions?.handlePointerEnter}
          onPointerLeave={rolly.interactions?.handlePointerLeave}
        >
          <mesh ref={paintRef} geometry={nodes.Body.geometry}>
            <meshStandardMaterial />
          </mesh>
          <group
            position={[0.706, 0, 1]}
            rotation={[Math.PI, 0, Math.PI]}
            scale={[0.429, 0.429, 0.078]}
          >
            <mesh geometry={nodes.Cube004.geometry} material={materials.eye} />
            <mesh
              geometry={nodes.Cube004_1.geometry}
              material={materials.pupil}
            />
          </group>
          <group
            position={[-0.706, 0, 1]}
            rotation={[Math.PI, 0, Math.PI]}
            scale={[0.429, 0.429, 0.078]}
          >
            <mesh geometry={nodes.Cube012.geometry} material={materials.eye} />
            <mesh
              geometry={nodes.Cube012_1.geometry}
              material={materials.pupil}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/rolly.glb");

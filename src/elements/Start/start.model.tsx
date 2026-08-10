import { type ThreeElements, type ThreeEvent } from "@react-three/fiber";
import type { GameInfos } from "@/scenes/Game/game.types";
import { type RefObject } from "react";
import { type Mesh } from "three";

const tileSize = 1;

type StartModelProps = ThreeElements["mesh"] & {
  gameInfos: GameInfos;
  start: {
    handlePointerEnter: (e: ThreeEvent<PointerEvent>) => void;
    // handlePointerLeave: (e: ThreeEvent<PointerEvent>) => void;
  };
};

export default function StartModel({
  gameInfos,
  start,
  ...props
}: StartModelProps) {
  return (
    <mesh
      {...props}
      position={[gameInfos.start.positionX, 0, 0]}
      onPointerEnter={start.handlePointerEnter}
    >
      <boxGeometry args={[tileSize * 1.25, 0.2, tileSize * 1.25]} />
      <meshStandardMaterial
        color={"#37393a"}
        emissive={gameInfos.placeHovered.type === "start" ? "#ffffff" : "#000000"}
        emissiveIntensity={gameInfos.placeHovered.type === "start" ? 0.15 : 0}
      />
    </mesh>
  );
}

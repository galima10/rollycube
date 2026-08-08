import { type ThreeElements, type ThreeEvent } from "@react-three/fiber";
import type { GameInfos } from "@/scenes/Game/game.types";
import { type RefObject } from "react";
import { type Mesh } from "three";

const tileSize = 1;

type StartModelProps = ThreeElements["mesh"] & {
  gameInfos: GameInfos;
  start: {
    handlePointerEnter: (e: ThreeEvent<PointerEvent>) => void;
    handlePointerLeave: (e: ThreeEvent<PointerEvent>) => void;
  };
  startRef: RefObject<Mesh>;
};

export default function StartModel({
  gameInfos,
  start,
  startRef,
  ...props
}: StartModelProps) {
  const boardDistance = gameInfos.board.boardSize / 2 + 3;
  return (
    <mesh
      {...props}
      position={[-boardDistance, 0, 0]}
      onPointerEnter={start.handlePointerEnter}
      onPointerLeave={start.handlePointerLeave}
      ref={startRef}
    >
      <boxGeometry args={[tileSize * 1.25, 0.05, tileSize * 1.25]} />
      <meshStandardMaterial
        // color={"#616365"}
        color={"red"}
        // emissive={tileHovered === tileId ? "#ffffff" : "#000000"}
        // emissiveIntensity={tileHovered === tileId ? 0.15 : 0}
      />
    </mesh>
  );
}

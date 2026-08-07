import type { Vector3Tuple } from "three";
import { Edges } from "@react-three/drei";
import type { BoardSizeType } from "./board.types";

const color = "#a5a9ab";
const tileColor = "#616365";
const tileSize = 2;

export default function BoardModel({
  size,
  hoverTile,
  tileHovered,
}: {
  size: BoardSizeType;
  hoverTile: (tileId: number | null) => void;
  tileHovered: null | number;
}) {
  return (
    <group>
      <Tiles
        size={size}
        tileSize={tileSize}
        hoverTile={hoverTile}
        tileHovered={tileHovered}
      />
      <Border size={size * tileSize} />
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[size * tileSize, 1, size * tileSize]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function TileModel({
  position,
  color,
  tileSize,
  hoverTile,
  tileHovered,
  tileId,
}: {
  position: Vector3Tuple;
  color: string;
  tileSize: number;
  hoverTile: (tileId: number | null) => void;
  tileHovered: null | number;
  tileId: number;
}) {
  return (
    <mesh
      position={position}
      onPointerLeave={(e) => {
        e.stopPropagation();
        hoverTile(null);
      }}
      onPointerEnter={(e) => {
        e.stopPropagation();
        hoverTile(tileId);
      }}
    >
      <boxGeometry args={[tileSize, 0.05, tileSize]} />
      <meshStandardMaterial color={tileHovered === tileId ? "red" : color} />
      <Edges color="white" lineWidth={2} />
    </mesh>
  );
}

function Tiles({
  size,
  tileSize,
  hoverTile,
  tileHovered,
}: {
  size: BoardSizeType;
  tileSize: number;
  hoverTile: (tileId: number | null) => void;
  tileHovered: null | number;
}) {
  return (
    <>
      {Array.from({ length: size * size }).map((_, i) => {
        const x = i % size;
        const z = Math.floor(i / size);

        return (
          <TileModel
            key={i}
            tileId={i}
            position={[
              (x - size / 2 + 0.5) * tileSize,
              0.11,
              (z - size / 2 + 0.5) * tileSize,
            ]}
            color={tileColor}
            tileSize={tileSize}
            hoverTile={hoverTile}
            tileHovered={tileHovered}
          />
        );
      })}
    </>
  );
}

function Border({ size }: { size: number }) {
  const thickness = tileSize / 3;
  const height = 1.16;

  return (
    <group position={[0, -0.42, 0]}>
      {/* haut */}
      <mesh position={[0, 0, size / 2 + thickness / 2]}>
        <boxGeometry args={[size + thickness * 2, height, thickness]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* bas */}
      <mesh position={[0, 0, -size / 2 - thickness / 2]}>
        <boxGeometry args={[size + thickness * 2, height, thickness]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* gauche */}
      <mesh position={[-size / 2 - thickness / 2, 0, 0]}>
        <boxGeometry args={[thickness, height, size + thickness * 2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* droite */}
      <mesh position={[size / 2 + thickness / 2, 0, 0]}>
        <boxGeometry args={[thickness, height, size + thickness * 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

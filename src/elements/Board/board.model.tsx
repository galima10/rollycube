import { Color, type Vector3Tuple, type Mesh } from "three";
import { Edges } from "@react-three/drei";
import type { BoardSizeType, BoardType } from "./board.types";
import { type RefObject } from "react";

const tileSize = 1;

export default function BoardModel({
  hoverTile,
  tileHovered,
  tileRefs,
  board,
}: {
  hoverTile: (tileId: number | null) => void;
  tileHovered: null | number;
  tileRefs: RefObject<Map<number, Mesh>>;
  board: BoardType;
}) {
  const size = Math.sqrt(Object.keys(board.tiles).length);
  const boardColor = "#a5a9ab";
  return (
    <group>
      <Tiles
        tileSize={tileSize}
        hoverTile={hoverTile}
        tileHovered={tileHovered}
        tileRefs={tileRefs}
        board={board}
      />
      <Border size={size * tileSize} color={boardColor} />
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[size * tileSize, 1, size * tileSize]} />
        <meshStandardMaterial color={boardColor} />
      </mesh>
    </group>
  );
}

function TileModel({
  position,
  tileSize,
  hoverTile,
  tileHovered,
  tileId,
  tileRefs,
  board,
}: {
  position: Vector3Tuple;
  tileSize: number;
  hoverTile: (tileId: number | null) => void;
  tileHovered: null | number;
  tileId: number;
  tileRefs: RefObject<Map<number, Mesh>>;
  board: BoardType;
}) {
  const tile = board.tiles[tileId];
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
      ref={(mesh) => {
        if (mesh) tileRefs.current.set(tileId, mesh);
        else tileRefs.current.delete(tileId);
      }}
    >
      <boxGeometry args={[tileSize, 0.05, tileSize]} />
      <meshStandardMaterial
        color={tile.color}
        emissive={tileHovered === tileId ? "#ffffff" : "#000000"}
        emissiveIntensity={tileHovered === tileId ? 0.15 : 0}
      />
      <Edges color="white" lineWidth={2} />
    </mesh>
  );
}

function Tiles({
  tileSize,
  hoverTile,
  tileHovered,
  tileRefs,
  board,
}: {
  tileSize: number;
  hoverTile: (tileId: number | null) => void;
  tileHovered: null | number;
  tileRefs: RefObject<Map<number, Mesh>>;
  board: BoardType;
}) {
  return (
    <>
      {Object.entries(board.tiles).map(([id, tile]) => {
        const tileId = Number(id);

        return (
          <TileModel
            key={tileId}
            tileId={tileId}
            position={[tile.position.x, 0.11, tile.position.z]}
            hoverTile={hoverTile}
            tileHovered={tileHovered}
            tileRefs={tileRefs}
            tileSize={tileSize}
            board={board}
          />
        );
      })}
    </>
  );
}

function Border({ size, color }: { size: number; color: string }) {
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

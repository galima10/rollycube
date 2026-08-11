import { type Vector3Tuple, type Mesh } from "three";
import { Edges } from "@react-three/drei";
import type { BoardType } from "./board.types";
import { type RefObject, useEffect } from "react";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import type { GameInfos } from "@/scenes/Game/game.types";
import { setColor } from "@/scenes/Game/set-color.utils";

export default function BoardModel({
  hoverTile,
  tileRefs,
  board,
  gameInfos,
}: {
  hoverTile: (tileId: number | null) => void;
  tileRefs: RefObject<Map<number, Mesh>>;
  board: {
    interactions: {
      handlePointerDown: (
        e: ThreeEvent<PointerEvent>,
        borderId: number,
      ) => void;
      handlePointerEnter: (e: ThreeEvent<PointerEvent>) => void;
      handlePointerLeave: (e: ThreeEvent<PointerEvent>) => void;
    };
    animations: {
      leanBoard: (delta: number) => void;
      returnBoard: (delta: number) => void;
    };
  };
  gameInfos: RefObject<GameInfos>;
}) {
  const size = Math.sqrt(
    Object.keys(gameInfos.current.board.tiles.grid).length,
  );
  const boardColor = "#a5a9ab";
  useFrame((_, delta) => {
    board.animations.leanBoard(delta);
    board.animations.returnBoard(delta);
  });
  return (
    <group dispose={null} rotation={[0, 0, 0]}>
      <Tiles
        hoverTile={hoverTile}
        tileRefs={tileRefs}
        board={gameInfos.current.board}
      />
      <Border
        size={size}
        color={boardColor}
        interactions={board.interactions}
      />
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[size, 1, size]} />
        <meshStandardMaterial color={boardColor} />
      </mesh>
    </group>
  );
}

function TileModel({
  position,
  hoverTile,
  tileId,
  tileRefs,
  defaultColor,
}: {
  position: Vector3Tuple;
  hoverTile: (tileId: number | null) => void;
  tileId: number;
  tileRefs: RefObject<Map<number, Mesh>>;
  defaultColor: string;
}) {
  useEffect(() => {
    const tileMesh = tileRefs.current.get(tileId);
    setColor(defaultColor, tileMesh);
  }, []);
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
      <boxGeometry args={[1, 0.05, 1]} />
      <meshStandardMaterial />
      <Edges color="white" lineWidth={2} />
    </mesh>
  );
}

function Tiles({
  hoverTile,
  tileRefs,
  board,
}: {
  hoverTile: (tileId: number | null) => void;
  tileRefs: RefObject<Map<number, Mesh>>;
  board: BoardType;
}) {
  return (
    <>
      {Object.entries(board.tiles.grid).map(([id, tile]) => {
        const tileId = Number(id);

        return (
          <TileModel
            key={tileId}
            tileId={tileId}
            position={[tile.position.x, 0.11, tile.position.z]}
            hoverTile={hoverTile}
            tileRefs={tileRefs}
            defaultColor={board.defaultTileColor}
          />
        );
      })}
    </>
  );
}

function Border({
  size,
  color,
  interactions,
}: {
  size: number;
  color: string;
  interactions: {
    handlePointerDown: (e: ThreeEvent<PointerEvent>, borderId: number) => void;
    handlePointerEnter: (e: ThreeEvent<PointerEvent>) => void;
    handlePointerLeave: (e: ThreeEvent<PointerEvent>) => void;
  };
}) {
  const thickness = 1 / 3;
  const height = 1.16;

  return (
    <group position={[0, -0.42, 0]}>
      {/* haut */}
      <mesh
        position={[0, 0, size / 2 + thickness / 2]}
        onPointerDown={(e) => interactions.handlePointerDown(e, 0)}
        onPointerEnter={interactions.handlePointerEnter}
        onPointerLeave={interactions.handlePointerLeave}
      >
        <boxGeometry args={[size + thickness * 2, height, thickness]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* bas */}
      <mesh
        position={[0, 0, -size / 2 - thickness / 2]}
        onPointerDown={(e) => interactions.handlePointerDown(e, 1)}
        onPointerEnter={interactions.handlePointerEnter}
        onPointerLeave={interactions.handlePointerLeave}
      >
        <boxGeometry args={[size + thickness * 2, height, thickness]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* gauche */}
      <mesh
        position={[-size / 2 - thickness / 2, 0, 0]}
        onPointerDown={(e) => interactions.handlePointerDown(e, 2)}
        onPointerEnter={interactions.handlePointerEnter}
        onPointerLeave={interactions.handlePointerLeave}
      >
        <boxGeometry args={[thickness, height, size + thickness * 2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* droite */}
      <mesh
        position={[size / 2 + thickness / 2, 0, 0]}
        onPointerDown={(e) => interactions.handlePointerDown(e, 3)}
        onPointerEnter={interactions.handlePointerEnter}
        onPointerLeave={interactions.handlePointerLeave}
      >
        <boxGeometry args={[thickness, height, size + thickness * 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

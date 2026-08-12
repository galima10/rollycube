import { type Mesh, MeshStandardMaterial } from "three";
import type { RefObject } from "react";
import type { GameInfos } from "@/scenes/Game/game.types";

export function colorTile(
  tileId: number,
  tileRefs: RefObject<Map<number, Mesh>>,
  gameInfos: RefObject<GameInfos>,
) {
  const newColor = gameInfos.current.rolly.color;
  gameInfos.current.board.tiles.grid[tileId].color = newColor;

  const tileMesh = tileRefs.current.get(tileId);
  if (tileMesh) {
    const material = tileMesh.material;

    if (material instanceof MeshStandardMaterial) {
      material.color.set(newColor);
    }
  }
}

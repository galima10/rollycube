import { type Mesh, MeshStandardMaterial } from "three";
import type { RefObject } from "react";
import type { GameInfos } from "@/Game/Scene/game.types";

export function colorTile(
  tileId: number,
  tileMesh: Mesh,
  gameInfos: RefObject<GameInfos>,
) {
  const newColor = gameInfos.current.rolly.color;
  gameInfos.current.board.tiles.grid[tileId].color = newColor;

  if (tileMesh) {
    const material = tileMesh.material;

    if (material instanceof MeshStandardMaterial) {
      material.color.set(newColor);
      material.emissive.set("#000000");
      material.emissiveIntensity = 0;
    }
  }
}

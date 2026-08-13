import type { RefObject } from "react";
import { type Mesh, MeshStandardMaterial } from "three";

export function setColor(newColor: string, mesh: Mesh) {
  const material = mesh.material;

  if (material instanceof MeshStandardMaterial) {
    material.color.set(newColor);
  }
}

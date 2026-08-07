import { useMemo } from "react";
import { MeshStandardMaterial } from "three";

export function getBucketMaterials() {
  const materials = {
    body: useMemo(
      () =>
        new MeshStandardMaterial({
          color: "#e7e9eb",
          roughness: 1,
          metalness: 0,
        }),
      [],
    ),
    handle: useMemo(
      () =>
        new MeshStandardMaterial({
          color: "#6e4b34",
          roughness: 1,
          metalness: 0,
        }),
      [],
    ),
  };
  return materials;
}

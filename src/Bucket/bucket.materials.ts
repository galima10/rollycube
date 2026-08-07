import { useMemo } from "react";
import { MeshStandardMaterial } from "three";

export function getBucketMaterials() {
  const materials = {
    body: useMemo(
      () =>
        new MeshStandardMaterial({
          color: "#e7e9eb",
        }),
      [],
    ),
    handle: useMemo(
      () =>
        new MeshStandardMaterial({
          color: "#6e4b34",
        }),
      [],
    ),
  };
  return materials;
}

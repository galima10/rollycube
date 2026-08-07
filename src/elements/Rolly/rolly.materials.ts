import { useMemo } from "react";
import { MeshStandardMaterial } from "three";

export function getRollyMaterials() {
  const materials = {
    eye: useMemo(
      () =>
        new MeshStandardMaterial({
          color: "#fff",
          roughness: 1,
          metalness: 0
        }),
      [],
    ),
    pupil: useMemo(
      () =>
        new MeshStandardMaterial({
          color: "#000",
          roughness: 1,
          metalness: 0
        }),
      [],
    ),
  };
  return materials;
}

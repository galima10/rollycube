import { useMemo } from "react";
import { MeshStandardMaterial } from "three";

export function getRollyMaterials() {
  const materials = {
    body: useMemo(
      () =>
        new MeshStandardMaterial({
          color: "#ffe920",
        }),
      [],
    ),
    eye: useMemo(
      () =>
        new MeshStandardMaterial({
          color: "#fff",
        }),
      [],
    ),
    pupil: useMemo(
      () =>
        new MeshStandardMaterial({
          color: "#000",
        }),
      [],
    ),
  };
  return materials;
}

import { Canvas } from "@react-three/fiber";
import { RollyModel } from "@/elements/Rolly/rolly.model";
import BoardModel from "@/elements/Board/board.model";
import { MOUSE } from "three";

import { OrbitControls, Environment } from "@react-three/drei";
import { useState } from "react";
export default function GameScene() {
  const [color, setColor] = useState("#ffe920");
  const [tileHovered, setTileHovered] = useState<null | number>(null);
  function hoverTile(tileId: number | null) {
    setTileHovered(tileId);
  }
  return (
    <Canvas
      camera={{
        position: [0, 2, 25],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
    >
      <OrbitControls
        enablePan={false}
        mouseButtons={{
          LEFT: MOUSE.PAN,
          MIDDLE: MOUSE.DOLLY,
          RIGHT: MOUSE.ROTATE,
        }}
      />
      <Environment preset="warehouse" />
      <RollyModel
        scale={[0.5, 0.5, 0.5]}
        paintColor={color}
        position={[0, 2, 0]}
      />
      <BoardModel size={16} hoverTile={hoverTile} tileHovered={tileHovered} />
    </Canvas>
  );
}

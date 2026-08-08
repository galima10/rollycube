import { Canvas } from "@react-three/fiber";
import { RollyModel } from "@/elements/Rolly/rolly.model";
import BoardModel from "@/elements/Board/board.model";
import { MOUSE } from "three";
import { OrbitControls, Environment } from "@react-three/drei";
import { useGame } from "./game.hook";

export default function GameScene() {
  const {
    tileHovered,
    hoverTile,
    handleRollyPointerDown,
    // dragRolly,
    handleRollyPointerUp,
    tileRefs,
    gameInfos,
    resetGame,
    rollyRef,
    // snapRolly
    animations
  } = useGame();
  const { rolly } = animations;

  return (
    <Canvas
      camera={{
        position: [0, 2, 25],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      onPointerUp={handleRollyPointerUp}
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
        paintColor={gameInfos.rolly.color}
        position={[0, 0.6, 0]}
        rollyRef={rollyRef}
        rolly={rolly}
        handleRollyPointerDown={handleRollyPointerDown}
      />
      <BoardModel
        hoverTile={hoverTile}
        tileHovered={tileHovered}
        tileRefs={tileRefs}
        board={gameInfos.board}
      />
    </Canvas>
  );
}

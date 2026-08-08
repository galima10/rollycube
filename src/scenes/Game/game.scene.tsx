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
    interactions,
    tileRefs,
    gameInfos,
    resetGame,
    rollyRef,
    boardRef,
    animations,
  } = useGame();

  return (
    <Canvas
      camera={{
        position: [0, 2, 25],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      onPointerUp={interactions.canvas.handlePointerUp}
      onPointerMove={interactions.canvas.handleBoardPointerMove}
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
      <group ref={boardRef} dispose={null}>
        <RollyModel
          scale={[0.5, 0.5, 0.5]}
          paintColor={gameInfos.rolly.color}
          position={[0, 0.6, 0]}
          rollyRef={rollyRef}
          rolly={{
            animations: animations.rolly,
            interactions: interactions.rolly,
          }}
        />
        <BoardModel
          hoverTile={hoverTile}
          tileHovered={tileHovered}
          tileRefs={tileRefs}
          board={{
            infos: gameInfos.board,
            interactions: interactions.board,
            animations: animations.board,
          }}
          // boardRef={boardRef}
        />
      </group>
    </Canvas>
  );
}

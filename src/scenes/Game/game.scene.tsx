import { Canvas } from "@react-three/fiber";
import { RollyModel } from "@/elements/Rolly/rolly.model";
import BoardModel from "@/elements/Board/board.model";
import { MOUSE } from "three";
import { OrbitControls, Environment } from "@react-three/drei";
import { useGame } from "./game.hook";
import { useBoard } from "@/elements/Board/board.hook";
import { useRolly } from "@/elements/Rolly/rolly.hook";

export default function GameScene() {
  const {
    setGameInfos,
    gameInfos,
    resetGame,
  } = useGame();

  const { boardRef, board, tileRefs, hoverTile } = useBoard(gameInfos, setGameInfos);
  const { rollyRef, rolly, } = useRolly(gameInfos, setGameInfos)

  return (
    <Canvas
      camera={{
        position: [0, 2, 25],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      onPointerUp={() => {
        board.interactions.handlePointerUp();
        rolly.interactions.handlePointerUp();
      }}
      onPointerMove={(e) => {
        board.interactions.handlePointerMove(e);
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
      <group ref={boardRef} dispose={null}>
        <RollyModel
          scale={[0.5, 0.5, 0.5]}
          paintColor={gameInfos.rolly.color}
          position={[0, 0.6, 0]}
          rollyRef={rollyRef}
          rolly={{
            animations: rolly.animations,
            interactions: rolly.interactions,
          }}
        />
        <BoardModel
          hoverTile={hoverTile}
          tileHovered={gameInfos.board.tiles.tileHovered}
          tileRefs={tileRefs}
          board={{
            infos: gameInfos.board,
            interactions: board.interactions,
            animations: board.animations,
          }}
        />
      </group>
    </Canvas>
  );
}

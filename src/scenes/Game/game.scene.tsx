import { Canvas } from "@react-three/fiber";
import RollyModel from "@/elements/Rolly/rolly.model";
import BoardModel from "@/elements/Board/board.model";
import StartModel from "@/elements/Start/start.model";
import BucketsModel from "@/elements/Bucket/bucket.model";
import { MOUSE } from "three";
import { OrbitControls, Environment } from "@react-three/drei";
import { useGame } from "./game.hook";
import { useBoard } from "@/elements/Board/board.hook";
import { useRolly } from "@/elements/Rolly/rolly.hook";
import { useStart } from "@/elements/Start/start.hook";

export default function GameScene() {
  const { setGameInfos, gameInfos, resetGame } = useGame();

  const { boardRef, board, tileRefs, hoverTile } = useBoard(
    gameInfos,
    setGameInfos,
  );
  const { rollyBoardRef, rollyWorldRef, rolly, isRollyWorld } = useRolly(
    gameInfos,
    setGameInfos,
  );

  const { start } = useStart(gameInfos, setGameInfos);

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
          position={[gameInfos.start.positionX, 0.6, 0]}
          rollyRef={rollyBoardRef}
          rolly={{
            animations: rolly.animations,
            interactions: rolly.interactions,
          }}
          visible={!isRollyWorld.current}
        />
        <BoardModel
          hoverTile={hoverTile}
          placeHovered={gameInfos.placeHovered.id}
          tileRefs={tileRefs}
          board={{
            infos: gameInfos.board,
            interactions: board.interactions,
            animations: board.animations,
          }}
        />
      </group>
      <RollyModel
        scale={[0.5, 0.5, 0.5]}
        paintColor={gameInfos.rolly.color}
        position={[gameInfos.start.positionX, 0.6, 0]}
        rollyRef={rollyWorldRef}
        rolly={{
          animations: {
            syncRollyWorldToRollyBoard:
              rolly.animations.syncRollyWorldToRollyBoard,
          },
          interactions: {},
        }}
        visible={isRollyWorld.current}
      />
      <StartModel position={[0, 4, 0]} gameInfos={gameInfos} start={start} />
      <BucketsModel gameInofs={gameInfos} />
    </Canvas>
  );
}

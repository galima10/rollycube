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
import { useBucket } from "@/elements/Bucket/bucket.hook";
import { useRoll } from "@/elements/Rolly/roll.hook";

export default function GameScene() {
  // const { setGameInfos, gameInfos, resetGame, gameRefs } = useGame();
  

  // const { boardRef, board, tileRefs, hoverTile } = useBoard(
  //   gameInfos,
  //   setGameInfos,
  //   gameRefs
  // );
  // const { rolly } = useRolly(gameInfos, setGameInfos, gameRefs);

  // const { start } = useStart(gameInfos, setGameInfos);
  // const { buckets } = useBucket(gameInfos, setGameInfos);

  // const { rollRolly } = useRoll(gameInfos, setGameInfos, gameRefs);

  const { gameInfos } = useGame();

  const { boardRef, board, tileRefs, hoverTile } = useBoard(
    gameInfos
  );
  const { rolly } = useRolly(gameInfos);

  const { start } = useStart(gameInfos);
  const { buckets } = useBucket(gameInfos);

  const { rollRolly } = useRoll(gameInfos);

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
          rollyRef={rolly.refs.rollyBoardRef}
          rolly={{
            animations: {
              rollRolly: rollRolly,
              snapRolly: rolly.animations.snapRolly,
              dragRolly: rolly.animations.dragRolly,
              syncRollyWorldToRollyBoard:
                rolly.animations.syncRollyWorldToRollyBoard,
            },
            interactions: rolly.interactions,
          }}
          visible={!rolly.refs.isRollyWorld.current}
        />
        <BoardModel
          hoverTile={hoverTile}
          tileRefs={tileRefs}
          board={{
            interactions: board.interactions,
            animations: board.animations,
          }}
          gameInfos={gameInfos}
        />
      </group>
      <RollyModel
        scale={[0.5, 0.5, 0.5]}
        paintColor={gameInfos.rolly.color}
        position={[gameInfos.start.positionX, 0.6, 0]}
        rollyRef={rolly.refs.rollyWorldRef}
        rolly={{
          animations: {
            syncRollyWorldToRollyBoard:
              rolly.animations.syncRollyWorldToRollyBoard,
          },
          interactions: {},
        }}
        visible={rolly.refs.isRollyWorld.current}
      />
      <StartModel position={[0, 4, 0]} gameInfos={gameInfos} start={start} />
      <BucketsModel gameInfos={gameInfos} buckets={buckets} />
    </Canvas>
  );
}

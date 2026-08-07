import { Canvas } from "@react-three/fiber";
import { RollyModel } from "./Rolly/rolly.model";
import { BucketModel } from "./Bucket/bucket.model";
import "@/styles/main.scss";
import { OrbitControls, Environment } from "@react-three/drei";

function App() {
  return (
    <main className="game">
      <Canvas>
        <OrbitControls />
        <Environment preset="warehouse" />
        <RollyModel paintColor="#e43939" position={[0, 5, 0]} />
        <BucketModel paintColor="#e43939" />
      </Canvas>
    </main>
  );
}

export default App;

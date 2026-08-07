import { Canvas } from "@react-three/fiber";
import { RollyModel } from "./Rolly/rolly.model";
import { BucketModel } from "./Bucket/bucket.model";
import "@/styles/main.scss";
import { OrbitControls, Environment } from "@react-three/drei";
import { useState } from "react";

function App() {
  const [color, setColor] = useState("#ffe226");
  setInterval(() => {
    if (color === "#ffe226") setColor("#e43939");
    else setColor("#ffe226");
  }, 2000);
  return (
    <main className="game">
      <Canvas>
        <OrbitControls />
        <Environment preset="warehouse" />
        <RollyModel paintColor={color} position={[0, 2, 0]} />
        <BucketModel paintColor={color} />
      </Canvas>
    </main>
  );
}

export default App;

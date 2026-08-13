import "@/styles/main.scss";
import GameScene from "./Game/Scene/game.scene";
import Hud from "./Game/Hud/hud";

function App() {
  return <main className="game">
    <GameScene />
    <Hud />
  </main>;
}

export default App;

import { Game as MainGame } from "./scenes/Game";
import { AUTO, Game, Types } from "phaser";
import PlayScene from "./scenes/Play";
import PreloadScene from "./scenes/Preload";
import MenuScene from "./scenes/Mainmenu";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [PreloadScene, MenuScene, PlayScene],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;

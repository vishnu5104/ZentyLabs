import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
        //fetch with this onwed asset / buy asset then use it as assets
    this.load.setPath("assets");
    this.load.image("sky", "sky.png");
    this.load.image("bomb", "bomb.png");
    //it needed top laod the gam,e asset as nft 

    this.load.image("player", "https://gateway.pinata.cloud/ipfs/QmbRJXyGXiqdJ6EzLLyKh7J8Th8B8m1mmYDxHM5q5RNd5X");
  }

  create() {
    this.scene.start("MenuScene");
  }
}

export default PreloadScene;

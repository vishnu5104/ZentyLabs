import Phaser from "phaser";
import cubeData from "../../../../cubeData.json"; // Adjust the path as needed
import { EventBus } from "../EventBus";

class PlayScene extends Phaser.Scene {
  private cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  private player: Phaser.Physics.Arcade.Sprite;
  private text: Phaser.GameObjects.Text;
  private hits: number;
  private speed: number;
  private lastPosition: { x: number; y: number };

  constructor() {
    super("PlayScene");
    this.lastPosition = { x: 0, y: 0 }; // To track position change
  }

  async create() {
    this.add.image(0, 0, "sky").setOrigin(0, 0);

    // Load player properties from the JSON file
    const playerPosition = this.loadPlayerProperties();

    this.player = this.physics.add
      .sprite(playerPosition?.x, playerPosition?.y, "player")
      .setOrigin(0, 0)
      .setCollideWorldBounds(true);

    this.player.setInteractive();
    this.input.setDraggable(this.player);

    // Handle dragging, but no saving here
    this.input.on("drag", (pointer, gameObject) => {
      gameObject.x = pointer.x;
      gameObject.y = pointer.y;
    });

    this.hits = 0;
    this.text = this.add
      .text(790, 10, "Hits: 0", {
        fontSize: "22px",
        fill: "#fff",
      })
      .setOrigin(1, 0);

    this.speed = 500;

    const bombs = this.physics.add.group();
    bombs.createMultiple({
      classType: Phaser.Physics.Arcade.Sprite,
      quantity: 5,
      key: "bomb",
      active: true,
      setXY: { x: 400, y: 300, stepX: 20, stepY: 20 },
    });

    bombs.getChildren().forEach((bomb: Phaser.Physics.Arcade.Sprite) => {
      bomb
        .setBounce(1)
        .setCollideWorldBounds(true)
        .setVelocity(
          Phaser.Math.Between(-500, 500),
          Phaser.Math.Between(-500, 500)
        )
        .setImmovable(true);
    });

    this.physics.add.collider(this.player, bombs, () => {
      this.hits++;
      this.text.setText(`Hits: ${this.hits}`);
      this.player.setX(400);
      this.player.setY(300);
    });

    // Initialize cursor keys
    this.cursor = this.input.keyboard?.createCursorKeys();

    EventBus.on("save", this.savePlayerPosition, this);

    EventBus.on("add-player", this.addPlayer, this);
  }

  addPlayer(x = 300, y = 400) {
    // here add as charecter as NFT
    const player = this.physics.add
      .image(x, y, "player")
      .setOrigin(0, 0) as Phaser.Physics.Arcade.Image;

    this.player.setImmovable(true);
    this.player.body.allowGravity = false;
    player.setCollideWorldBounds(true);

    // Make the player draggable
    player.setInteractive({ draggable: true });
    this.input.setDraggable(player);

    // Drag events, but no automatic saving
    player.on(
      "drag",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        player.x = dragX;
        player.y = dragY;
      }
    );
  }

  update() {
    const { up, down, left, right } = this.cursor;

    if (up.isDown) {
      this.player.setVelocity(0, -this.speed);
    } else if (down.isDown) {
      this.player.setVelocity(0, this.speed);
    } else if (left.isDown) {
      this.player.setVelocity(-this.speed, 0);
    } else if (right.isDown) {
      this.player.setVelocity(this.speed, 0);
    } else {
      this.player.setVelocity(0, 0);
    }
  }

  // Save only the player's x and y positions
  private async savePlayerPosition() {
    const playerPosition = {
      x: this.player.x,
      y: this.player.y,
    };

    try {
      const response = await fetch("/api/save-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playerPosition), // Send only x and y
      });

      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error("Error saving player position:", error);
    }
  }

  // Load player position from cubeData
  private loadPlayerProperties() {
    return cubeData; // Assuming cubeData.json exports an object with x and y properties
  }
}

export default PlayScene;

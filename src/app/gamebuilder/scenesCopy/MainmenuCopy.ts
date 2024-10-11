import Phaser from "phaser";
import { EventBus } from "../EventBus"; // Ensure the correct path

class MenuScene extends Phaser.Scene {
    private playButton: Phaser.GameObjects.Text;
    private marketplace: Phaser.GameObjects.Text;

    constructor() {
        super("MenuScene");
    }

    preload() {
        // Load the background image
        this.load.image('sky', '/assets/sky.png'); // Ensure the correct path to your asset
    }

    create() {
        // Add a background
        this.add.image(400, 300, "sky").setOrigin(0.5); // Adjust coordinates for center positioning

        // Add a title
        this.add
            .text(400, 150, "My Phaser Game", {
                fontSize: "48px",
                fill: "#ffffff",
            })
            .setOrigin(0.5);

        // Add a Play button
        this.playButton = this.add
            .text(400, 400, "Play", {
                fontSize: "32px",
                fill: "#ffffff",
            })
            .setOrigin(0.5)
            .setInteractive();

        // Add a Marketplace button
        this.marketplace = this.add
            .text(400, 500, "Marketplace", {
                fontSize: "32px",
                fill: "#ffffff",
            })
            .setOrigin(0.5)
            .setInteractive();

        // Handle Play button click
        this.playButton.on("pointerdown", () => {
            this.scene.start("PlayScene");
        });

        // Handle Marketplace button click
        this.marketplace.on("pointerdown", () => {
            this.scene.start("Marketplace");
        });

        // Listen for the save event
        EventBus.on('save-main-menu', this.saveMainMenu, this);
    }

    // Save main menu state (or perform other save logic)
    private async saveMainMenu() {
        const menuState = {
            title: "My Phaser Game",
            buttons: ["Play", "Marketplace"]
        };

        try {
            const response = await fetch('/api/save-main-menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(menuState),
            });

            const result = await response.json();
            console.log(result.message); // Display success message or handle error
        } catch (error) {
            console.error('Error saving main menu:', error);
        }
    }
}

export default MenuScene;

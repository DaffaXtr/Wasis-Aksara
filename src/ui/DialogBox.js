import Phaser from 'phaser';

/**
 * Reusable DialogBox Widget for Phaser Scenes.
 * Displays character dialog texts with stone-dark backgrounds and gold borders.
 */
export default class DialogBox extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene - Target Scene
   * @param {number} x - X Coordinate
   * @param {number} y - Y Coordinate
   * @param {number} width - Box Width
   * @param {number} height - Box Height
   */
  constructor(scene, x, y, width = 800, height = 180) {
    super(scene, x, y);

    // Stone dark theme background with gold border
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x3e3228, 0.9); // stone.dark
    this.bg.lineStyle(4, 0x8b6a2b, 1); // majapahit.darkGold
    this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
    this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    this.add(this.bg);

    // Character Name Text
    this.nameText = scene.add.text(-width / 2 + 25, -height / 2 + 15, 'Nama Karakter', {
      fontFamily: 'Cinzel',
      fontSize: '20px',
      color: '#d4a64a',
      fontWeight: 'bold'
    });
    this.add(this.nameText);

    // Dialog Text Content (wrapped)
    this.messageText = scene.add.text(-width / 2 + 25, -height / 2 + 50, 'Isi dialog cerita/narasi di sini...', {
      fontFamily: 'Poppins',
      fontSize: '16px',
      color: '#e8e1d4',
      wordWrap: { width: width - 50 }
    });
    this.add(this.messageText);

    // Next Prompt / Skip Indicator
    this.nextIndicator = scene.add.text(width / 2 - 40, height / 2 - 25, '▶', {
      font: '14px Poppins',
      fill: '#fff2cc'
    }).setOrigin(0.5);
    
    // Simple flashing animation on next indicator
    scene.tweens.add({
      targets: this.nextIndicator,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      loop: -1
    });
    this.add(this.nextIndicator);

    // Register Container to Scene
    scene.add.existing(this);
  }

  /**
   * Update character name and dialog text displayed.
   * @param {string} name - Character name
   * @param {string} text - Conversation line
   */
  setText(name, text) {
    this.nameText.setText(name);
    this.messageText.setText(text);
  }
}

import Phaser from 'phaser';

/**
 * Reusable Base Panel Widget for Phaser.
 * Creates consistent overlay/modal panels with a solid dark stone background and gold trims.
 */
export default class Panel extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene - Target Scene
   * @param {number} x - X Coordinate
   * @param {number} y - Y Coordinate
   * @param {number} width - Panel Width
   * @param {number} height - Panel Height
   * @param {string} title - Optional Panel Title
   */
  constructor(scene, x, y, width = 600, height = 400, title = '') {
    super(scene, x, y);

    // Stone Dark Background
    this.background = scene.add.graphics();
    this.background.fillStyle(0x3e3228, 0.95); // stone.dark
    this.background.lineStyle(4, 0x8b6a2b, 1); // majapahit.darkGold
    
    // Draw base panel card
    this.background.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
    this.background.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);

    // Draw inner padding frame for visual depth
    this.background.lineStyle(2, 0x5a4a3b, 0.6); // stone.light
    this.background.strokeRoundedRect(-width / 2 + 8, -height / 2 + 8, width - 16, height - 16, 12);
    
    this.add(this.background);

    // Add Title if specified
    if (title) {
      this.titleText = scene.add.text(0, -height / 2 + 35, title.toUpperCase(), {
        fontFamily: 'Cinzel',
        fontSize: '24px',
        color: '#f2d28a', // lightGold
        fontWeight: 'bold',
        letterSpacing: 2
      }).setOrigin(0.5);
      
      this.add(this.titleText);

      // Title Separator Line
      this.titleLine = scene.add.graphics();
      this.titleLine.lineStyle(2, 0x8b6a2b, 0.8);
      this.titleLine.lineBetween(-width / 3, -height / 2 + 60, width / 3, -height / 2 + 60);
      this.add(this.titleLine);
    }

    // Register Container to Scene
    scene.add.existing(this);
  }
}

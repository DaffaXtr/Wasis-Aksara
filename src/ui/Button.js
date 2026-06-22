import Phaser from 'phaser';
import AudioManager from '../managers/AudioManager.js';

/**
 * Reusable Custom Button Widget for Phaser Scenes.
 * Includes interactive hover scaling and click sound cues.
 */
export default class Button extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene - Target Scene
   * @param {number} x - X Coordinate
   * @param {number} y - Y Coordinate
   * @param {string} text - Button Label Text
   * @param {Object} style - Custom styling options
   * @param {Function} callback - Callback function on click
   */
  constructor(scene, x, y, text, style = {}, callback = null) {
    super(scene, x, y);

    const width = style.width || 240;
    const height = style.height || 50;
    const bgColor = style.bgColor !== undefined ? style.bgColor : 0x8b6a2b; // default majapahit-darkGold
    const strokeColor = style.strokeColor !== undefined ? style.strokeColor : 0xd4a64a; // default majapahit-gold
    const labelColor = style.labelColor || '#fff2cc'; // default majapahit-cream

    // Background Graphic (Gold Trimming style)
    this.bg = scene.add.graphics();
    this.bg.fillStyle(bgColor, 1);
    this.bg.lineStyle(3, strokeColor, 1);
    this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    this.add(this.bg);

    // Label Text
    this.label = scene.add.text(0, 0, text, {
      fontFamily: style.fontFamily || 'Poppins',
      fontSize: style.fontSize || '18px',
      color: labelColor,
      fontWeight: 'semibold'
    }).setOrigin(0.5);
    this.add(this.label);

    // Hit Area for Interaction
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: true });

    // Hover Events
    this.on('pointerover', () => {
      this.setScale(1.05); // Micro-animation zoom
      this.label.setColor('#ffffff');
    });

    this.on('pointerout', () => {
      this.setScale(1.0);
      this.label.setColor(labelColor);
    });

    // Press Event
    this.on('pointerdown', () => {
      this.setScale(0.98);
    });

    this.on('pointerup', () => {
      this.setScale(1.05);
      // Play SFX click
      AudioManager.playSFX('click');
      
      if (callback) {
        callback();
      }
    });

    // Register Container to Scene
    scene.add.existing(this);
  }
}

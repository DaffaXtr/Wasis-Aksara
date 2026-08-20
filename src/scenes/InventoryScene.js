import Phaser from 'phaser';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

/**
 * InventoryScene: Panel album koleksi 5 benda pusaka Majapahit.
 */
export default class InventoryScene extends Phaser.Scene {
  constructor() {
    super('InventoryScene');
  }

  create() {
    console.log('InventoryScene: created.');

    // Fade in camera & fullscreen curtain
    fadeTransitionIn(this, 500);

    this.add.text(640, 100, 'ALBUM KELENGKAPAN PUSAKA', {
      fontFamily: 'Cinzel',
      fontSize: '32px',
      color: '#d4a64a',
      fontWeight: 'semibold'
    }).setOrigin(0.5);

    this.add.text(640, 360, '[5 Pusaka Majapahit: Miniatur Wringin Lawang, Cawan Tirta Swara, dll.]', {
      fontFamily: 'Poppins',
      fontSize: '20px',
      color: '#e8e1d4'
    }).setOrigin(0.5);

    this.add.text(640, 600, 'Klik untuk Kembali ke Peta', {
      fontFamily: 'Poppins',
      fontSize: '14px',
      color: '#fff2cc'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      fadeTransitionOut(this, 500, () => {
        this.scene.start('MapScene');
      });
    });
  }
}

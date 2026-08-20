import Phaser from 'phaser';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

/**
 * KamusScene: Overlay kamus panduan referensi Aksara Jawa.
 */
export default class KamusScene extends Phaser.Scene {
  constructor() {
    super('KamusScene');
  }

  create() {
    console.log('KamusScene: created.');

    // Fade in camera & fullscreen curtain
    fadeTransitionIn(this, 500);

    this.add.text(640, 100, 'KAMUS AKSARA JAWA', {
      fontFamily: 'Cinzel',
      fontSize: '32px',
      color: '#d4a64a',
      fontWeight: 'semibold'
    }).setOrigin(0.5);

    this.add.text(640, 360, '[Panduan Referensi Aksara Legena, Sandhangan, Pasangan, dll.]', {
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

import Phaser from 'phaser';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

/**
 * FinalChallengeScene: Babak altar pamungkas penyusunan kalimat filosofis.
 */
export default class FinalChallengeScene extends Phaser.Scene {
  constructor() {
    super('FinalChallengeScene');
  }

  create() {
    console.log('FinalChallengeScene: created.');

    // Fade in camera & fullscreen curtain
    fadeTransitionIn(this, 500);

    this.add.text(640, 100, 'ALTAR PAMUNGKAS', {
      fontFamily: 'Cinzel',
      fontSize: '32px',
      color: '#d4a64a',
      fontWeight: 'semibold'
    }).setOrigin(0.5);

    this.add.text(640, 360, '[Gameplay: Penyusunan Kalimat Filosofis Jawa]', {
      fontFamily: 'Poppins',
      fontSize: '20px',
      color: '#e8e1d4'
    }).setOrigin(0.5);

    this.add.text(640, 600, 'Klik untuk Menyelesaikan Game', {
      fontFamily: 'Poppins',
      fontSize: '14px',
      color: '#fff2cc'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      fadeTransitionOut(this, 500, () => {
        this.scene.start('EndingScene');
      });
    });
  }
}

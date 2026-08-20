import Phaser from 'phaser';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

/**
 * EndingScene: Cutscene sinematik penutup cerita game.
 */
export default class EndingScene extends Phaser.Scene {
  constructor() {
    super('EndingScene');
  }

  create() {
    console.log('EndingScene: created.');

    // Fade in camera & fullscreen curtain
    fadeTransitionIn(this, 500);

    this.add.text(640, 200, 'SELAMAT!', {
      fontFamily: 'Cinzel',
      fontSize: '48px',
      color: '#d4a64a',
      fontWeight: 'bold'
    }).setOrigin(0.5);

    this.add.text(640, 300, 'Anda Telah Menyelesaikan Petualangan Wasis Aksara', {
      fontFamily: 'Marcellus',
      fontSize: '24px',
      color: '#fff2cc'
    }).setOrigin(0.5);

    this.add.text(640, 400, 'Baskara berhasil mengumpulkan pusaka leluhur Majapahit.', {
      fontFamily: 'Poppins',
      fontSize: '18px',
      color: '#e8e1d4'
    }).setOrigin(0.5);

    this.add.text(640, 600, 'Klik untuk Kembali ke Menu Utama', {
      fontFamily: 'Poppins',
      fontSize: '14px',
      color: '#fff2cc'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      fadeTransitionOut(this, 500, () => {
        this.scene.start('MainMenuScene');
      });
    });
  }
}

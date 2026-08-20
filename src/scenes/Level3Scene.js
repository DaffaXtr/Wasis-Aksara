import Phaser from 'phaser';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

/**
 * Level3Scene: Modul gameplay Level 3 (Pasangan - Word Puzzle)
 */
export default class Level3Scene extends Phaser.Scene {
  constructor() {
    super('Level3Scene');
  }

  create() {
    console.log('Level3Scene: created.');
    
    // Fade in camera & fullscreen curtain
    fadeTransitionIn(this, 500);

    this.add.text(640, 100, 'LEVEL 3: PASANGAN AKSARA', {
      fontFamily: 'Cinzel',
      fontSize: '32px',
      color: '#d4a64a',
      fontWeight: 'semibold'
    }).setOrigin(0.5);

    this.add.text(640, 360, '[Gameplay: Word Puzzle - Susun Pasangan Aksara Jawa Membentuk Kata]', {
      fontFamily: 'Poppins',
      fontSize: '20px',
      color: '#e8e1d4'
    }).setOrigin(0.5);

    this.add.text(640, 600, 'Klik untuk menyelesaikan level', {
      fontFamily: 'Poppins',
      fontSize: '14px',
      color: '#fff2cc'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      fadeTransitionOut(this, 500, () => {
        this.scene.start('ResultScene', { level: 3, score: 850, stars: 3 });
      });
    });
  }
}

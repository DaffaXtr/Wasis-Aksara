import Phaser from 'phaser';

/**
 * Level4Scene: Modul gameplay Level 4 (Murda & Rekan - Formula Puzzle)
 */
export default class Level4Scene extends Phaser.Scene {
  constructor() {
    super('Level4Scene');
  }

  create() {
    console.log('Level4Scene: created.');
    
    // Fade in camera
    this.cameras.main.fadeIn(500, 0, 0, 0);

    this.add.text(640, 100, 'LEVEL 4: MURDA & REKAN', {
      fontFamily: 'Cinzel',
      fontSize: '32px',
      color: '#d4a64a',
      fontWeight: 'semibold'
    }).setOrigin(0.5);

    this.add.text(640, 360, '[Gameplay: Formula Puzzle - Susun Aksara Murda & Rekan]', {
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
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('ResultScene', { level: 4, score: 700, stars: 2 });
      });
    });
  }
}

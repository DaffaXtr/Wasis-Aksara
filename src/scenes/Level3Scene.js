import Phaser from 'phaser';

/**
 * Level3Scene: Modul gameplay Level 3 (Pasangan - Fill in Blank)
 */
export default class Level3Scene extends Phaser.Scene {
  constructor() {
    super('Level3Scene');
  }

  create() {
    console.log('Level3Scene: created.');
    
    // Fade in camera
    this.cameras.main.fadeIn(500, 0, 0, 0);

    this.add.text(640, 100, 'LEVEL 3: PASANGAN', {
      fontFamily: 'Cinzel',
      fontSize: '32px',
      color: '#d4a64a',
      fontWeight: 'semibold'
    }).setOrigin(0.5);

    this.add.text(640, 360, '[Gameplay: Fill in Blank - Lengkapi Pasangan Aksara]', {
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
        this.scene.start('ResultScene', { level: 3, score: 950, stars: 3 });
      });
    });
  }
}

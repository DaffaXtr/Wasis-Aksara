import Phaser from 'phaser';

/**
 * Level5Scene: Modul gameplay Level 5 (Aksara Swara - Audio Recognition)
 */
export default class Level5Scene extends Phaser.Scene {
  constructor() {
    super('Level5Scene');
  }

  create() {
    console.log('Level5Scene: created.');
    
    // Fade in camera
    this.cameras.main.fadeIn(500, 0, 0, 0);

    this.add.text(640, 100, 'LEVEL 5: AKSARA SWARA', {
      fontFamily: 'Cinzel',
      fontSize: '32px',
      color: '#d4a64a',
      fontWeight: 'semibold'
    }).setOrigin(0.5);

    this.add.text(640, 360, '[Gameplay: Audio Recognition - Dengar Suara dan Pilih Aksara Swara yang Benar]', {
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
        this.scene.start('ResultScene', { level: 5, score: 1200, stars: 3 });
      });
    });
  }
}

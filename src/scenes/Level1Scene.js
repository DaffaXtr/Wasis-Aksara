import Phaser from 'phaser';

/**
 * Level1Scene: Modul gameplay Level 1 (Aksara Legena - Drag & Drop)
 */
export default class Level1Scene extends Phaser.Scene {
  constructor() {
    super('Level1Scene');
  }

  create() {
    console.log('Level1Scene: created.');
    
    // Fade in camera
    this.cameras.main.fadeIn(500, 0, 0, 0);

    this.add.text(640, 100, 'LEVEL 1: AKSARA LEGENA', {
      fontFamily: 'Cinzel',
      fontSize: '32px',
      color: '#d4a64a',
      fontWeight: 'semibold'
    }).setOrigin(0.5);

    this.add.text(640, 360, '[Gameplay: Drag & Drop Aksara Jawa ke Latin]', {
      fontFamily: 'Poppins',
      fontSize: '20px',
      color: '#e8e1d4'
    }).setOrigin(0.5);

    // Navigasi ke ResultScene
    this.add.text(640, 600, 'Klik untuk menyelesaikan level', {
      fontFamily: 'Poppins',
      fontSize: '14px',
      color: '#fff2cc'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('ResultScene', { level: 1, score: 1000, stars: 3 });
      });
    });
  }
}

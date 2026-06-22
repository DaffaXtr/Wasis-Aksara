import Phaser from 'phaser';

/**
 * BootScene: Menginisialisasi loading bar minimalis dan memicu PreloadScene.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    console.log('BootScene: preloading assets...');
    // Di sini kita bisa meload aset loading bar jika diperlukan
  }

  create() {
    console.log('BootScene: created. Lock orientation handled by CSS/main.js.');
    
    this.scene.start('PreloadScene');
  }
}

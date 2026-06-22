import Phaser from 'phaser';
import SaveManager from '../managers/SaveManager.js';

/**
 * PreloadScene: Memuat seluruh aset gambar, audio, dan data ke dalam memori.
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    console.log('PreloadScene: loading game assets...');
    
    // Tampilan Loading Bar Sederhana
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x3e3228, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Memuat Aset...',
      style: {
        font: '20px Poppins',
        fill: '#e8e1d4'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px Poppins',
        fill: '#fff2cc'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    // Event listeners untuk progress loading
    this.load.on('progress', (value) => {
      percentText.setText(parseInt(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xd4a64a, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Meload aset gambar untuk main menu
    this.load.image('BG_MainMenu', 'assets/images/BG_MainMenu.webp');
    this.load.image('Logo', 'assets/images/Logo.webp');
    this.load.image('baskara-idle', 'assets/sprites/baskara-idle.webp');

    // Meload aset audio
    this.load.audio('backsound', 'assets/audio/backsound.mp3');
  }

  create() {
    console.log('PreloadScene: assets loaded. Starting game...');
    const saveData = SaveManager.load();
    const startScene = saveData.lastActiveScene || 'MainMenuScene';
    console.log(`PreloadScene: Resuming from last active scene: ${startScene}`);
    this.scene.start(startScene);
  }
}

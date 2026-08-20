import Phaser from 'phaser';
import SaveManager from '../managers/SaveManager.js';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

/**
 * ResultScene: Tampilan kalkulasi skor, bintang, & artefak per level.
 */
export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create(data) {
    console.log('ResultScene: created. Received data:', data);
    
    // 0. FADE IN MAIN CAMERA & FULLSCREEN CURTAIN
    fadeTransitionIn(this, 500);

    const level = data.level || 1;
    const score = data.score || 0;
    const stars = data.stars || 0;

    // 1. SAVE PROGRESS DYNAMICALLY
    const currentSave = SaveManager.load();
    currentSave.stars = currentSave.stars || [0, 0, 0, 0, 0];
    currentSave.scores = currentSave.scores || [0, 0, 0, 0, 0];

    // Save level stars if higher
    if (stars > currentSave.stars[level - 1]) {
      currentSave.stars[level - 1] = stars;
    }
    // Save level high score if higher
    if (score > currentSave.scores[level - 1]) {
      currentSave.scores[level - 1] = score;
    }

    // Unlock next level
    const nextLevel = level + 1;
    if (level === currentSave.currentLevel && nextLevel <= 5) {
      currentSave.currentLevel = nextLevel;
    }

    // Update total score
    currentSave.score = currentSave.scores.reduce((sum, s) => sum + s, 0);

    // Persist save state
    SaveManager.save(currentSave);

    // 2. RENDER RESULT ELEMENTS
    this.add.text(640, 150, 'HASIL TANTANGAN', {
      fontFamily: 'Cinzel',
      fontSize: '40px',
      color: '#d4a64a',
      fontWeight: 'bold'
    }).setOrigin(0.5);

    this.add.text(640, 230, `Level ${level} Menyelesaikan Candi`, {
      fontFamily: 'Marcellus',
      fontSize: '24px',
      color: '#fff2cc'
    }).setOrigin(0.5);

    // Bintang
    let starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    this.add.text(640, 320, starStr, {
      fontFamily: 'Poppins',
      fontSize: '48px',
      color: '#f2d28a'
    }).setOrigin(0.5);

    this.add.text(640, 400, `Skor Diperoleh: ${score}`, {
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

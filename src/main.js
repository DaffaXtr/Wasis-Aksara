import Phaser from 'phaser';
import { phaserConfig } from './config/phaserConfig.js';

/**
 * Wasis Aksara Game Entrypoint
 */
class WasisAksaraGame extends Phaser.Game {
  constructor() {
    super(phaserConfig);
  }
}

window.addEventListener('load', () => {
  // Kunci orientasi layar ke lanskap (jika didukung perangkat/browser)
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch((err) => {
      console.warn('Screen orientation lock to landscape failed/unsupported:', err);
    });
  }
  
  // Set up resize logic for HTML UI Overlay
  const resizeUIOverlay = () => {
    const container = document.getElementById('ui-overlay-container');
    if (!container) return;

    const targetWidth = 1280;
    const targetHeight = 720;
    const targetRatio = targetWidth / targetHeight;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowRatio = windowWidth / windowHeight;

    let scale = 1;
    if (windowRatio > targetRatio) {
      // Window is wider than 16:9 - size is limited by height
      scale = windowHeight / targetHeight;
    } else {
      // Window is narrower than 16:9 - size is limited by width
      scale = windowWidth / targetWidth;
    }

    container.style.transform = `translate(-50%, -50%) scale(${scale})`;
  };

  // Run resize initially and bind to window events
  resizeUIOverlay();
  window.addEventListener('resize', resizeUIOverlay);
  window.addEventListener('orientationchange', resizeUIOverlay);

  // Initialize the game instance on window load
  window.game = new WasisAksaraGame();
  console.log('Wasis Aksara Game Initialized Successfully.');
});

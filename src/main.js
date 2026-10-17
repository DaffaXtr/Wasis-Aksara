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

/**
 * Di HP/tablet: masuk layar penuh pada sentuhan pertama agar bilah alamat browser
 * tidak memotong layar, lalu kunci orientasi ke lanskap (kunci orientasi hanya
 * diizinkan browser saat layar penuh).
 */
const setupMobileFullscreen = () => {
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  const root = document.documentElement;
  const requestFullscreen = root.requestFullscreen || root.webkitRequestFullscreen;
  if (!isTouchDevice || !requestFullscreen) return;

  const enterFullscreen = () => {
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    Promise.resolve(requestFullscreen.call(root, { navigationUI: 'hide' }))
      .then(() => screen.orientation?.lock?.('landscape'))
      .catch((err) => console.warn('Fullscreen/orientation lock unsupported:', err));
  };
  // Dipasang terus (bukan sekali) supaya setelah pemain keluar layar penuh, sentuhan berikutnya masuk lagi.
  document.addEventListener('pointerup', enterFullscreen);
};

window.addEventListener('load', () => {
  setupMobileFullscreen();

  // Set up resize logic for HTML UI Overlay
  const resizeUIOverlay = () => {
    const container = document.getElementById('ui-overlay-container');
    if (!container) return;

    const targetWidth = 1280;
    const targetHeight = 720;
    const targetRatio = targetWidth / targetHeight;

    // Ukur area yang benar-benar terlihat (bukan 100vh, yang di HP ikut menghitung bilah alamat)
    const viewport = container.parentElement;
    const windowWidth = viewport?.clientWidth || window.innerWidth;
    const windowHeight = viewport?.clientHeight || window.innerHeight;
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
  window.visualViewport?.addEventListener('resize', resizeUIOverlay);
  document.addEventListener('fullscreenchange', resizeUIOverlay);

  // Initialize the game instance on window load
  window.game = new WasisAksaraGame();
  console.log('Wasis Aksara Game Initialized Successfully.');
});

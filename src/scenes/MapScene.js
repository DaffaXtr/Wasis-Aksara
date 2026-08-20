import Phaser from 'phaser';
import SaveManager from '../managers/SaveManager.js';
import mapOverlayTemplate from '../templates/MapOverlay.html?raw';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

/**
 * MapScene: Hub peta interaktif pemilihan level candi Trowulan.
 */
export default class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene');
  }

  create() {
    console.log('MapScene: created.');

    // 0. FADE IN MAIN CAMERA & FULLSCREEN CURTAIN
    fadeTransitionIn(this, 500);

    // Save last active scene state
    const currentSave = SaveManager.load();
    currentSave.lastActiveScene = 'MapScene';
    SaveManager.save(currentSave);

    // 1. SET BACKGROUND IMAGE ON GAME CONTAINER
    const gameContainer = document.getElementById('wasis-aksara-game')?.parentElement;
    if (gameContainer) {
      gameContainer.style.backgroundImage = "url('/assets/images/map.webp')";
      gameContainer.style.backgroundSize = "cover";
      gameContainer.style.backgroundPosition = "center";
    }

    // Inject Map HTML template
    const uiContainer = document.getElementById('ui-overlay-container');
    if (uiContainer) {
      uiContainer.innerHTML = mapOverlayTemplate;
    }

    // Show overlay with fade-in
    const overlay = document.getElementById('map-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.classList.add('flex');
      overlay.style.opacity = '0';
      this.time.delayedCall(50, () => {
        overlay.style.transition = 'opacity 0.5s ease-in-out';
        overlay.style.opacity = '1';
      });
    }

    // Helper for smooth transitions (100% fullscreen)
    const startSceneWithFade = (sceneKey) => {
      if (overlay) {
        overlay.style.transition = 'opacity 0.5s ease-in-out';
        overlay.style.opacity = '0';
      }
      fadeTransitionOut(this, 500, () => {
        this.scene.start(sceneKey);
      });
    };

    // Handle home button click
    const btnHome = document.getElementById('map-btn-home');
    if (btnHome) {
      btnHome.onclick = () => {
        console.log('MapScene: Navigating to MainMenuScene with fade...');
        startSceneWithFade('MainMenuScene');
      };
    }

    // 2. CONFIGURE INTERACTIVE MAP NODES DYNAMICALLY
    const currentLevel = currentSave.currentLevel || 1;
    const stars = currentSave.stars || [0, 0, 0, 0, 0];
    const scores = currentSave.scores || [0, 0, 0, 0, 0];

    for (let i = 1; i <= 5; i++) {
      const node = document.getElementById(`map-node-${i}`);
      const btn = document.getElementById(`btn-node-${i}`);
      const lockOverlay = document.getElementById(`node-${i}-lock`);
      const pulseRing = document.getElementById(`node-${i}-pulse`);
      const starsIndicator = document.getElementById(`node-${i}-stars`);
      const scoreIndicator = document.getElementById(`node-${i}-score`);
      const actionText = document.getElementById(`node-${i}-action-text`);

      const isUnlocked = i <= currentLevel;
      const starsCount = stars[i - 1] || 0;
      const scoreValue = scores[i - 1] || 0;

      if (node) {
        if (!isUnlocked) {
          // Locked state styling
          node.classList.add('opacity-60');
          if (lockOverlay) {
            lockOverlay.classList.remove('hidden');
            lockOverlay.classList.add('flex');
          }
          if (pulseRing) pulseRing.classList.add('hidden');
          if (btn) {
            btn.disabled = true;
            btn.classList.remove('cursor-pointer', 'active:scale-95', 'hover:scale-110');
            btn.classList.add('cursor-not-allowed');
          }
          if (actionText) {
            actionText.innerText = 'Terkunci';
            actionText.className = 'text-center font-poppins text-[10px] text-stone-soft/40 font-bold mt-2.5 bg-stone-light/20 rounded-md py-1 border border-stone-light/10 uppercase tracking-wider';
          }
        } else {
          // Unlocked state styling
          node.classList.remove('opacity-60');
          if (lockOverlay) {
            lockOverlay.classList.add('hidden');
            lockOverlay.classList.remove('flex');
          }
          
          // Current active level has pulse effect
          if (i === currentLevel) {
            if (pulseRing) pulseRing.classList.remove('hidden');
            if (actionText) {
              actionText.innerText = 'Mainkan';
              actionText.className = 'text-center font-poppins text-[10px] text-majapahit-cream font-bold mt-2.5 bg-majapahit-gold/40 rounded-md py-1 border border-majapahit-gold/30 uppercase tracking-wider animate-pulse';
            }
          } else {
            // Completed levels
            if (pulseRing) pulseRing.classList.add('hidden');
            if (actionText) {
              actionText.innerText = 'Main Lagi';
              actionText.className = 'text-center font-poppins text-[10px] text-majapahit-cream font-bold mt-2.5 bg-nature-light-forest/30 rounded-md py-1 border border-nature-light-forest/20 uppercase tracking-wider';
            }
          }

          if (btn) {
            btn.onclick = () => {
              console.log(`MapScene: Starting Level ${i}Scene with fade...`);
              startSceneWithFade(`Level${i}Scene`);
            };
          }
        }

        // Render stars representation
        if (starsIndicator) {
          starsIndicator.innerHTML = '';
          for (let s = 0; s < 3; s++) {
            const starSpan = document.createElement('span');
            if (s < starsCount) {
              starSpan.className = 'text-majapahit-gold';
              starSpan.innerText = '★';
            } else {
              starSpan.className = 'text-stone-light';
              starSpan.innerText = '★';
            }
            starsIndicator.appendChild(starSpan);
          }
        }

        // Set best score text
        if (scoreIndicator) {
          scoreIndicator.innerText = `Skor Terbaik: ${scoreValue}`;
        }
      }
    }

    // Cleanup on scene shutdown
    this.events.once('shutdown', () => {
      if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        overlay.style.opacity = '0';
      }

      if (gameContainer) {
        gameContainer.style.backgroundImage = 'none';
      }

      if (uiContainer) {
        uiContainer.innerHTML = '';
      }

      if (btnHome) {
        btnHome.onclick = null;
      }

      for (let i = 1; i <= 5; i++) {
        const btn = document.getElementById(`btn-node-${i}`);
        if (btn) btn.onclick = null;
      }
    });
  }
}

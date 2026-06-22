import Phaser from 'phaser';
import prologOverlayTemplate from '../templates/PrologOverlay.html?raw';
import SaveManager from '../managers/SaveManager.js';

/**
 * PrologScene: Animasi dialog visual cerita awal Baskara.
 */
export default class PrologScene extends Phaser.Scene {
  constructor() {
    super('PrologScene');
    this.narrativeSteps = [
      "Baskara menemukan sebuah batu bertuliskan aksara Jawa kuno.",
      "Saat menyentuh permukaan batu yang kasar, tiba-tiba aksara Jawa kuno di batu tersebut mulai bersinar keemasan.",
      "Tanah di sekitarnya berguncang, dan sebuah pusaran angin magis muncul di hadapannya.",
      "Sebuah gerbang lintas waktu (portal) terbuka lebar, menarik Baskara masuk ke dalam pusaran cahaya.",
      "Baskara terbangun di tengah hutan yang rimbun dengan pemandangan Candi Trowulan yang megah di kejauhan.",
      "Seorang tetua desa mendekatinya dan berkata: 'Selamat datang, Sang Penyelamat. Kerajaan Majapahit sedang dalam bahaya.'",
      "Tetua menjelaskan: 'Kekuatan magis pelindung kerajaan terpecah menjadi 5 pusaka aksara yang tersebar di 5 candi suci.'",
      "Baskara dibekali sebuah kitab kamus aksara kuno untuk membantunya memecahkan teka-teki sandi.",
      "Petualangan dimulai! Bantu Baskara mengumpulkan 5 pusaka aksara Jawa kuno untuk menyelamatkan Majapahit!"
    ];
    this.currentStep = 0;
    this.typewriterTimer = null;
  }

  create() {
    console.log('PrologScene: created.');
    this.currentStep = 0;

    // 0. FADE IN MAIN CAMERA
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Inject Prolog HTML template
    const uiContainer = document.getElementById('ui-overlay-container');
    if (uiContainer) {
      uiContainer.innerHTML = prologOverlayTemplate;
    }

    // Save last active scene state
    const currentSave = SaveManager.load();
    currentSave.lastActiveScene = 'PrologScene';
    SaveManager.save(currentSave);

    // 1. SET BACKGROUND TRANSITION LAYERS ON GAME CONTAINER
    const gameContainer = document.getElementById('wasis-aksara-game')?.parentElement;
    let bgLayerA = document.getElementById('prolog-bg-layer-a');
    let bgLayerB = document.getElementById('prolog-bg-layer-b');

    if (gameContainer) {
      gameContainer.style.backgroundImage = 'none';

      if (!bgLayerA) {
        bgLayerA = document.createElement('div');
        bgLayerA.id = 'prolog-bg-layer-a';
        bgLayerA.className = 'absolute inset-0 w-full h-full bg-cover bg-center z-0 pointer-events-none transition-opacity duration-500 ease-in-out opacity-0';
        gameContainer.insertBefore(bgLayerA, gameContainer.firstChild);
      }
      
      if (!bgLayerB) {
        bgLayerB = document.createElement('div');
        bgLayerB.id = 'prolog-bg-layer-b';
        bgLayerB.className = 'absolute inset-0 w-full h-full bg-cover bg-center z-0 pointer-events-none transition-opacity duration-500 ease-in-out opacity-0';
        gameContainer.insertBefore(bgLayerB, bgLayerA);
      }
    }

    // 2. SHOW PROLOG OVERLAY (TAILWIND DOM)
    const overlay = document.getElementById('prolog-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.classList.add('flex');
      overlay.style.opacity = '0';
      this.time.delayedCall(50, () => {
        overlay.style.transition = 'opacity 0.5s ease-in-out';
        overlay.style.opacity = '1';
      });
    }

    // Get elements
    const prologText = document.getElementById('prolog-text');
    const prologStepText = document.getElementById('prolog-step-text');
    const prologProgressBar = document.getElementById('prolog-progress-bar');
    const prologBtnNext = document.getElementById('prolog-btn-next');
    const prologBtnSkip = document.getElementById('prolog-btn-skip');
    const prologNextLabel = document.getElementById('prolog-next-label');

    // Typewriter effect function
    const typeText = (text, speed = 25) => {
      if (this.typewriterTimer) clearInterval(this.typewriterTimer);
      prologText.innerHTML = '';
      let idx = 0;
      this.typewriterTimer = setInterval(() => {
        if (idx < text.length) {
          prologText.innerHTML += text.charAt(idx);
          idx++;
        } else {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = null;
        }
      }, speed);
    };

    // Update state of current step
    const updateStep = () => {
      if (prologStepText) {
        prologStepText.innerText = `${this.currentStep + 1} / 9`;
      }
      if (prologProgressBar) {
        prologProgressBar.style.width = `${((this.currentStep + 1) / 9) * 100}%`;
      }
      if (prologNextLabel) {
        prologNextLabel.innerText = this.currentStep === 8 ? 'MULAI' : 'LANJUT';
      }

      // Update background image with smooth cross-fade transition
      if (bgLayerA && bgLayerB) {
        const stepNum = this.currentStep + 1;
        const newBgUrl = `url('/assets/images/prolog${stepNum}.webp')`;
        const isLayerAActive = bgLayerA.classList.contains('opacity-100');

        if (isLayerAActive) {
          bgLayerB.style.backgroundImage = newBgUrl;
          bgLayerB.classList.remove('opacity-0');
          bgLayerB.classList.add('opacity-100');
          bgLayerA.classList.remove('opacity-100');
          bgLayerA.classList.add('opacity-0');
        } else {
          bgLayerA.style.backgroundImage = newBgUrl;
          bgLayerA.classList.remove('opacity-0');
          bgLayerA.classList.add('opacity-100');
          bgLayerB.classList.remove('opacity-100');
          bgLayerB.classList.add('opacity-0');
        }
      }

      typeText(this.narrativeSteps[this.currentStep]);
    };

    // Initialize first step
    updateStep();

    // Transition out helper
    const startMapSceneWithFade = () => {
      if (overlay) {
        overlay.style.transition = 'opacity 0.5s ease-in-out';
        overlay.style.opacity = '0';
      }
      if (bgLayerA) {
        bgLayerA.style.transition = 'opacity 0.5s ease-in-out';
        bgLayerA.style.opacity = '0';
      }
      if (bgLayerB) {
        bgLayerB.style.transition = 'opacity 0.5s ease-in-out';
        bgLayerB.style.opacity = '0';
      }
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('MapScene');
      });
    };

    // Next Button click handler
    if (prologBtnNext) {
      prologBtnNext.onclick = () => {
        // If still typing, complete the text instantly
        if (this.typewriterTimer) {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = null;
          prologText.innerHTML = this.narrativeSteps[this.currentStep];
        } else {
          // Play click sound or feedback if any
          if (this.currentStep < 8) {
            this.currentStep++;
            updateStep();
          } else {
            console.log('PrologScene: Finished. Starting MapScene with fade...');
            startMapSceneWithFade();
          }
        }
      };
    }

    // Skip Button click handler
    if (prologBtnSkip) {
      prologBtnSkip.onclick = () => {
        console.log('PrologScene: Skipped. Starting MapScene with fade...');
        startMapSceneWithFade();
      };
    }

    // 3. CLEANUP EVENT SHUTDOWN
    this.events.once('shutdown', () => {
      // Clear typewriter interval
      if (this.typewriterTimer) {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
      }

      // Hide overlay
      if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        overlay.style.opacity = '0';
      }

      // Reset background image and remove layers
      if (gameContainer) {
        gameContainer.style.backgroundImage = 'none';
      }
      if (bgLayerA) bgLayerA.remove();
      if (bgLayerB) bgLayerB.remove();

      // Empty the UI overlay container
      if (uiContainer) {
        uiContainer.innerHTML = '';
      }

      // Clean event listeners to prevent memory leaks
      const elements = [prologBtnNext, prologBtnSkip];
      elements.forEach(el => {
        if (el) el.onclick = null;
      });
    });
  }
}

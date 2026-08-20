import Phaser from 'phaser';
import AudioManager from '../managers/AudioManager.js';
import mainMenuTemplate from '../templates/MainMenuOverlay.html?raw';
import SaveManager from '../managers/SaveManager.js';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

/**
 * MainMenuScene: Halaman menu utama interaktif.
 */
export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    console.log('MainMenuScene: created.');

    // 0. FADE IN MAIN CAMERA & FULLSCREEN CURTAIN
    fadeTransitionIn(this, 500);

    // Inject Main Menu & Kamus HTML template
    const uiContainer = document.getElementById('ui-overlay-container');
    if (uiContainer) {
      uiContainer.innerHTML = mainMenuTemplate;
    }

    // Save last active scene state
    const currentSave = SaveManager.load();
    currentSave.lastActiveScene = 'MainMenuScene';
    SaveManager.save(currentSave);

    // Initialize AudioManager and play backsound at a low volume
    AudioManager.init(this.sound);
    AudioManager.bgmVolume = 0.15; // Set volume to 15% (not too loud)
    AudioManager.playBGM('backsound', true);

    // Resume audio context on first user click/tap to bypass browser autoplay policy
    const resumeAudio = () => {
      if (this.sound && this.sound.context && this.sound.context.state === 'suspended') {
        this.sound.context.resume().then(() => {
          console.log('AudioContext resumed successfully on user gesture.');
        });
      }
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };
    document.addEventListener('click', resumeAudio);
    document.addEventListener('touchstart', resumeAudio);
    
    // 1. TAMPILLAN BACKGROUND & KARAKTER DI CANVAS PHASER
    // Set background on HTML container for full viewport coverage (covers side bars)
    const gameContainer = document.getElementById('wasis-aksara-game')?.parentElement;
    if (gameContainer) {
      gameContainer.style.backgroundImage = "url('/assets/images/bg_home.png')";
      gameContainer.style.backgroundSize = "cover";
      gameContainer.style.backgroundPosition = "center";
    }

    // Karakter Baskara di Sisi Kiri (Anchored at the bottom edge of the canvas)
    const baskara = this.add.image(320, 520, 'baskara-idle');
    baskara.setScale(0.95);
    baskara.setOrigin(0.5, 0.5);

    // Efek Micro-Animation Breathing (Bernapas) untuk Baskara (bouncing slightly at bottom)
    this.tweens.add({
      targets: baskara,
      y: 532,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Generate programmatic leaf textures for falling leaves effect
    const leafColors = [
      { name: 'leaf-green', color: '#3f5d47' }, // nature-light-forest
      { name: 'leaf-gold', color: '#d4a64a' },  // majapahit-gold
      { name: 'leaf-dark', color: '#243a2c' }   // nature-forest
    ];

    leafColors.forEach(item => {
      if (!this.textures.exists(item.name)) {
        const canvas = this.textures.createCanvas(item.name, 16, 16);
        const ctx = canvas.context;
        ctx.fillStyle = item.color;
        
        // Draw leaf blade shape
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.quadraticCurveTo(16, 6, 8, 12);
        ctx.quadraticCurveTo(0, 6, 8, 0);
        ctx.fill();

        // Draw leaf stem
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 12);
        ctx.lineTo(8, 15);
        ctx.stroke();

        canvas.refresh();
      }
    });

    // Create falling leaves particle emitters for each color
    leafColors.forEach(item => {
      this.add.particles(0, 0, item.name, {
        x: { min: 0, max: 1280 },
        y: -20,
        lifespan: 10000,
        speedY: { min: 40, max: 100 },
        speedX: { min: -20, max: 20 },
        scale: { min: 0.3, max: 0.8 },
        quantity: 1,
        frequency: 800 + Math.random() * 400,
        angle: { min: 0, max: 360 },
        rotate: { start: 0, end: 360 },
        rotateSpeed: { min: 30, max: 120 },
        gravityY: 15,
        alpha: { min: 0.6, max: 0.9 }
      });
    });

    // 2. KONTROL INTERAKSI DOM UI OVERLAY (TAILWIND)
    const overlay = document.getElementById('main-menu-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.classList.add('flex', 'flex-col', 'justify-between');
      // Fade-in animation effect
      overlay.style.opacity = '0';
      this.time.delayedCall(50, () => {
        overlay.style.transition = 'opacity 0.5s ease-in-out';
        overlay.style.opacity = '1';
      });
    }

    // Helper function for smooth scene transitions (100% fullscreen)
    const startSceneWithFade = (sceneKey) => {
      if (overlay) {
        overlay.style.transition = 'opacity 0.5s ease-in-out';
        overlay.style.opacity = '0';
      }
      fadeTransitionOut(this, 500, () => {
        this.scene.start(sceneKey);
      });
    };

    // Callback untuk membuka dan menutup Kamus Overlay
    const openKamusOverlay = () => {
      const kamusModal = document.getElementById('kamus-modal');
      if (kamusModal) {
        kamusModal.classList.remove('hidden');
        kamusModal.classList.add('flex');
        requestAnimationFrame(() => {
          kamusModal.classList.remove('opacity-0');
          kamusModal.classList.add('opacity-100');
        });
      }
    };

    const closeKamusOverlay = () => {
      const kamusModal = document.getElementById('kamus-modal');
      if (kamusModal) {
        kamusModal.classList.replace('opacity-100', 'opacity-0');
        this.time.delayedCall(300, () => {
          kamusModal.classList.add('hidden');
          kamusModal.classList.remove('flex');
        });
      }
    };

    const kamusBtnClose = document.getElementById('kamus-btn-close');
    if (kamusBtnClose) kamusBtnClose.onclick = closeKamusOverlay;

    // Mapping Tombol DOM ke Aksi Phaser
    const btnMulai = document.getElementById('menu-btn-mulai');
    if (btnMulai) {
      btnMulai.onclick = () => {
        console.log('MainMenuScene: Starting PrologScene with fade...');
        startSceneWithFade('PrologScene');
      };
    }

    const btnKamus = document.getElementById('menu-btn-kamus');
    if (btnKamus) btnKamus.onclick = openKamusOverlay;

    const navBtnKamus = document.getElementById('nav-btn-kamus');
    if (navBtnKamus) navBtnKamus.onclick = openKamusOverlay;

    const navBtnAchievement = document.getElementById('nav-btn-achievement');
    if (navBtnAchievement) {
      navBtnAchievement.onclick = () => {
        console.log('MainMenuScene: Navigating to AchievementScene with fade...');
        startSceneWithFade('AchievementScene');
      };
    }

    const navBtnKoleksi = document.getElementById('nav-btn-koleksi');
    if (navBtnKoleksi) {
      navBtnKoleksi.onclick = () => {
        console.log('MainMenuScene: Navigating to InventoryScene with fade...');
        startSceneWithFade('InventoryScene');
      };
    }

    // Tombol Pengaturan (Menampilkan Pesan Sederhana untuk Sementara)
    const openSettings = () => {
      alert('Pengaturan Game Wasis Aksara: Volume BGM & SFX dapat diatur di sini.');
    };
    const btnPengaturan = document.getElementById('menu-btn-pengaturan');
    if (btnPengaturan) btnPengaturan.onclick = openSettings;

    const navBtnPengaturan = document.getElementById('nav-btn-pengaturan');
    if (navBtnPengaturan) navBtnPengaturan.onclick = openSettings;

    // Quick info: Tutorial & Tentang Game
    const btnTutorial = document.getElementById('quick-btn-tutorial');
    if (btnTutorial) {
      btnTutorial.onclick = () => {
        alert('Panduan Singkat: Pasangkan Aksara Jawa dengan Latin, selesaikan 5 Candi, dan kumpulkan pusaka Majapahit!');
      };
    }

    const btnAbout = document.getElementById('quick-btn-about');
    if (btnAbout) {
      btnAbout.onclick = () => {
        alert('Tentang Game: Wasis Aksara v1.0.0. Game Edukasi Sejarah & Aksara Jawa Kerajaan Majapahit.');
      };
    }

    // 3. EVENT SHUTDOWN: Reset state overlay saat berpindah scene
    this.events.once('shutdown', () => {
      if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex', 'flex-col', 'justify-between');
        overlay.style.opacity = '0';
      }
      
      // Reset background DOM
      if (gameContainer) {
        gameContainer.style.backgroundImage = 'none';
      }

      // Empty the UI overlay container
      if (uiContainer) {
        uiContainer.innerHTML = '';
      }
      
      // Bersihkan event handlers untuk mencegah memory leak
      const ids = [
        'menu-btn-mulai', 'menu-btn-kamus', 'nav-btn-kamus', 
        'nav-btn-achievement', 'nav-btn-koleksi', 'nav-btn-pengaturan', 
        'menu-btn-pengaturan', 'quick-btn-tutorial', 'quick-btn-about'
      ];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.onclick = null;
      });
    });
  }
}

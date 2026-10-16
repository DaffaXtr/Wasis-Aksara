import Phaser from 'phaser';
import AudioManager from '../managers/AudioManager.js';
import mainMenuTemplate from '../templates/MainMenuOverlay.html?raw';
import SaveManager from '../managers/SaveManager.js';
import { levelData } from '../data/levelData.js';
import { renderCP, renderEvaluasi, renderMateri, renderPandhuan, renderProfil, renderTP } from '../ui/menuPanels.js';
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
    const playBacksound = () => AudioManager.playBGM('backsound', true);
    if (this.cache.audio.exists('backsound')) {
      playBacksound();
    } else {
      // Musik (±3 MB) dimuat setelah menu tampil agar layar pertama tidak ikut menunggu
      this.load.audio('backsound', 'assets/audio/backsound.mp3');
      this.load.once('complete', playBacksound);
      this.load.start();
    }

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
      gameContainer.style.backgroundImage = "url('/assets/images/bg_home.webp')";
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

    // Modal helper: Kamus & modal informasi memakai pola buka/tutup yang sama
    const openModal = (modal) => {
      if (!modal) return;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      requestAnimationFrame(() => modal.classList.replace('opacity-0', 'opacity-100'));
    };
    const closeModal = (modal) => {
      if (!modal) return;
      modal.classList.replace('opacity-100', 'opacity-0');
      this.time.delayedCall(300, () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      });
    };

    const kamusModal = document.getElementById('kamus-modal');
    const infoModal = document.getElementById('menu-info-modal');
    const infoBody = document.getElementById('menu-info-body');
    const infoFooter = document.getElementById('menu-info-footer');
    const closeInfo = () => closeModal(infoModal);

    // Membuka modal informasi dengan isi dari menuPanels (CP, TP, Profil, Materi, Pandhuan, Evaluasi)
    const openInfo = (renderPanel) => {
      infoBody.innerHTML = '';
      infoBody.scrollTop = 0;
      infoFooter.innerHTML = '';
      infoFooter.classList.replace('flex', 'hidden');
      const { title, subtitle } = renderPanel({ body: infoBody, footer: infoFooter, close: closeInfo });
      document.getElementById('menu-info-title').textContent = title;
      document.getElementById('menu-info-subtitle').textContent = subtitle;
      openModal(infoModal);
    };

    // 3. PROGRES PEMAIN (candi rampung = item yang sudah didapat)
    const completed = levelData.filter((level) => currentSave.items.includes(level.reward.id));
    document.getElementById('menu-progress-text').textContent = `${completed.length}/${levelData.length} Candi`;
    document.getElementById('menu-progress-items').textContent = completed.map((level) => level.reward.icon).join(' ');
    this.time.delayedCall(300, () => {
      document.getElementById('menu-progress-bar').style.width = `${(completed.length / levelData.length) * 100}%`;
    });

    // Ikon tombol Swara mengikuti status bisu AudioManager
    const updateAudioIcon = (muted) => {
      document.getElementById('quick-audio-on')?.classList.toggle('hidden', muted);
      document.getElementById('quick-audio-off')?.classList.toggle('hidden', !muted);
    };
    updateAudioIcon(AudioManager.isMuted);

    // 4. MAPPING TOMBOL DOM KE AKSI
    const actions = {
      'menu-btn-mulai': () => startSceneWithFade('PrologScene'),
      'menu-btn-peta': () => startSceneWithFade('MapScene'),
      'menu-btn-materi': () => openInfo(renderMateri),
      'menu-btn-evaluasi': () => openInfo(renderEvaluasi),
      'nav-btn-cp': () => openInfo(renderCP),
      'nav-btn-tp': () => openInfo(renderTP),
      'nav-btn-kamus': () => openModal(kamusModal),
      'nav-btn-profil': () => openInfo(renderProfil),
      'quick-btn-pandhuan': () => openInfo(renderPandhuan),
      'quick-btn-audio': () => updateAudioIcon(AudioManager.toggleMute()),
      'kamus-btn-close': () => closeModal(kamusModal),
      'menu-info-close': closeInfo
    };
    Object.entries(actions).forEach(([id, action]) => {
      const element = document.getElementById(id);
      if (element) element.onclick = action;
    });

    // 5. EVENT SHUTDOWN: Reset state overlay saat berpindah scene
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

      // Bersihkan event handlers untuk mencegah memory leak
      Object.keys(actions).forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.onclick = null;
      });

      // Empty the UI overlay container
      if (uiContainer) {
        uiContainer.innerHTML = '';
      }
    });
  }
}

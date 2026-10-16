import Phaser from 'phaser';
import SaveManager from '../managers/SaveManager.js';
import mapOverlayTemplate from '../templates/MapOverlay.html?raw';
import { candiData, levelData } from '../data/levelData.js';
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
    // Peta utama digambar di dalam overlay; latar ini hanya mengisi sisi layar di luar rasio 16:9.
    const gameContainer = document.getElementById('wasis-aksara-game')?.parentElement;
    if (gameContainer) {
      gameContainer.style.backgroundImage = 'radial-gradient(circle at center, #3e2a17 0%, #1c130b 100%)';
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

    // 2. BUILD INTERACTIVE MAP NODES FROM levelData
    // Koordinat levelData.map dalam persen gambar → piksel kanvas UI 1280×720.
    const toPx = ([x, y]) => [(x / 100) * 1280, (y / 100) * 720];
    const nodesContainer = document.getElementById('map-nodes');
    const nodeTemplate = document.getElementById('map-node-template');
    const romanNumerals = ['I', 'II', 'III', 'IV'];
    const ACTION_STYLES = {
      locked: ['Terkunci', 'border-stone-light/10 bg-stone-light/20 text-stone-soft/40'],
      active: ['Mainkan', 'border-majapahit-gold/30 bg-majapahit-gold/40 text-majapahit-cream animate-pulse'],
      done: ['Main Lagi', 'border-nature-light-forest/20 bg-nature-light-forest/30 text-majapahit-cream']
    };

    levelData.forEach((info) => {
      const i = info.level;
      const node = nodeTemplate.content.firstElementChild.cloneNode(true);
      const slot = (name) => node.querySelector(`[data-slot="${name}"]`);
      const isDone = currentSave.items.includes(info.reward.id);
      const status = i > currentSave.currentLevel ? 'locked' : isDone ? 'done' : 'active';

      // Titik acuan node = tengah bangunan candi
      const [templeX, templeY] = toPx(info.map.temple);
      const [plateX0, plateY0] = toPx(info.map.plate.slice(0, 2));
      const [plateX1, plateY1] = toPx(info.map.plate.slice(2));
      node.style.left = `${templeX}px`;
      node.style.top = `${templeY}px`;

      // Papan nama DOM sedikit lebih besar dari papan bawaan gambar agar menutupinya penuh
      const plateWrap = slot('plate-wrap');
      plateWrap.style.left = `${(plateX0 + plateX1) / 2 - templeX}px`;
      plateWrap.style.top = `${plateY0 - templeY - 2}px`;
      slot('plate').style.minWidth = `${plateX1 - plateX0 + 6}px`;
      slot('plate').style.height = `${plateY1 - plateY0 + 4}px`;
      slot('plate').textContent = info.title;

      // Tooltip di atas candi, atau di bawah papan nama untuk candi yang letaknya tinggi
      const tooltip = slot('tooltip');
      if (info.map.temple[1] < 35) {
        tooltip.style.top = `${plateY1 - templeY + 44}px`;
      } else {
        tooltip.style.bottom = '76px';
      }
      slot('heading').textContent = `TANTANGAN ${romanNumerals[i - 1]}`;
      slot('title').textContent = info.title;
      slot('candi').textContent = candiData[info.candi]?.name || '';
      slot('description').textContent = info.description;
      slot('score').textContent = `Skor Terbaik: ${currentSave.scores[i - 1] || 0}`;
      slot('reward').textContent = `Hadiah: ${info.reward.icon} ${info.reward.name}`;
      const [actionLabel, actionClasses] = ACTION_STYLES[status];
      slot('action').textContent = actionLabel;
      slot('action').classList.add(...actionClasses.split(' '));

      const btn = slot('button');
      btn.setAttribute('aria-label', `Tantangan ${i}: ${info.title} (${actionLabel})`);

      if (status === 'locked') {
        slot('fog').classList.remove('hidden');
        slot('lock').classList.replace('hidden', 'flex');
        btn.disabled = true;
      } else {
        btn.onclick = () => {
          console.log(`MapScene: Starting ${info.sceneKey} with fade...`);
          startSceneWithFade(info.sceneKey);
        };
      }

      if (status === 'active') {
        slot('pulse').classList.remove('hidden');
        slot('ribbon').classList.remove('hidden');
      }

      if (status === 'done') {
        const starsCount = currentSave.stars[i - 1] || 0;
        slot('stars').innerHTML = [0, 1, 2]
          .map((s) => `<span class="${s < starsCount ? 'text-majapahit-gold' : 'text-stone-light'}">★</span>`)
          .join('');
        slot('stars').classList.remove('hidden');
        slot('item').textContent = info.reward.icon;
        slot('item').classList.replace('hidden', 'flex');
      }

      nodesContainer.appendChild(node);
    });

    // Penghitung pusaka pada kotak kanan atas
    const collected = levelData.filter((info) => currentSave.items.includes(info.reward.id));
    document.getElementById('map-item-count').textContent = `${collected.length}/${levelData.length}`;
    document.getElementById('map-item-icons').textContent = collected.map((info) => info.reward.icon).join(' ');

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

      nodesContainer?.querySelectorAll('button').forEach((btn) => { btn.onclick = null; });
    });
  }
}

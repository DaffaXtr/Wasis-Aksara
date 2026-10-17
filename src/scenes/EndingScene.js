import Phaser from 'phaser';
import SaveManager from '../managers/SaveManager.js';
import endingTemplate from '../templates/EndingOverlay.html?raw';
import { levelData } from '../data/levelData.js';
import { sfxReward } from '../utils/sfx.js';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

/**
 * EndingScene: Rekap petualangan setelah Level 4 — papan skor seluruh level dan
 * avatar Baskara memakai mahkota sambil memegang gulungan kertas.
 */
export default class EndingScene extends Phaser.Scene {
  constructor() {
    super('EndingScene');
  }

  create() {
    fadeTransitionIn(this, 500);
    const save = SaveManager.load();
    save.lastActiveScene = 'EndingScene';
    SaveManager.save(save);

    this.gameContainer = document.getElementById('wasis-aksara-game')?.parentElement;
    if (this.gameContainer) {
      this.gameContainer.style.backgroundImage = "linear-gradient(rgba(20,14,8,.6), rgba(20,14,8,.6)), url('/assets/images/Bg_CandiTikusNew.webp')";
      this.gameContainer.style.backgroundSize = 'cover';
      this.gameContainer.style.backgroundPosition = 'center';
    }

    this.uiContainer = document.getElementById('ui-overlay-container');
    if (this.uiContainer) this.uiContainer.innerHTML = endingTemplate;
    const $ = (id) => document.getElementById(id);

    const collected = levelData.filter((info) => save.items.includes(info.reward.id));
    $('ending-message').textContent = collected.length === levelData.length
      ? 'Baskara wis ngrampungake kabeh tantangan lan nglumpukake 4 pusaka. Mahkota iki tandha kawasisanmu ing aksara Jawa, lan gulungan kertas iki dadi cathetan petualanganmu!'
      : `Baskara wis nglumpukake ${collected.length} saka ${levelData.length} pusaka. Rampungna tantangan liyane ing Peta Jelajah!`;

    levelData.forEach((info, index) => {
      const answers = save.levelResults[info.level]?.answers || [];
      const stars = save.stars[index] || 0;
      const row = document.createElement('div');
      row.className = 'grid grid-cols-[28px_1fr_78px_60px_60px_40px] items-center gap-3 rounded-lg border border-majapahit-dark-gold/50 bg-[#251d16] px-3 py-2';
      row.innerHTML = `
        <span class="font-cinzel text-[14px] font-bold text-majapahit-light-gold">${info.level}</span>
        <span class="font-poppins text-[13px] font-semibold text-majapahit-cream" data-slot="title"></span>
        <span class="text-[16px] tracking-wider">${[0, 1, 2].map((s) => `<span class="${s < stars ? 'text-majapahit-gold' : 'text-stone-light'}">★</span>`).join('')}</span>
        <span class="font-poppins text-[13px] text-stone-soft">${answers.length ? `${answers.filter((answer) => answer.correct).length} / ${answers.length}` : '—'}</span>
        <span class="font-cinzel text-[15px] font-bold text-majapahit-light-gold">${save.scores[index] || 0}</span>
        <span class="text-[20px] leading-none" title="${info.reward.name}">${save.items.includes(info.reward.id) ? info.reward.icon : '·'}</span>`;
      row.querySelector('[data-slot="title"]').textContent = info.title;
      $('ending-levels').appendChild(row);
    });
    const totalStars = save.stars.reduce((sum, value) => sum + value, 0);
    $('ending-stars').textContent = `★ ${totalStars} / ${levelData.length * 3}`;
    $('ending-total').textContent = save.score;

    const overlay = $('ending-overlay');
    requestAnimationFrame(() => overlay.classList.replace('opacity-0', 'opacity-100'));
    sfxReward();

    const go = (sceneKey) => {
      overlay.classList.replace('opacity-100', 'opacity-0');
      fadeTransitionOut(this, 500, () => this.scene.start(sceneKey));
    };
    $('ending-btn-map').onclick = () => go('MapScene');
    $('ending-btn-menu').onclick = () => go('MainMenuScene');

    this.events.once('shutdown', () => {
      if (this.uiContainer) this.uiContainer.innerHTML = '';
      if (this.gameContainer) this.gameContainer.style.backgroundImage = 'none';
    });
  }
}

import Phaser from 'phaser';
import SaveManager from '../managers/SaveManager.js';
import ScoreManager from '../managers/ScoreManager.js';
import HintManager from '../managers/HintManager.js';
import { level1Data } from '../data/level1Data.js';
import { levelData } from '../data/levelData.js';
import level1Template from '../templates/Level1Overlay.html?raw';
import { sfxError, sfxOpen, sfxReward, sfxSuccess, sfxWrite, speakNarration, stopNarration } from '../utils/sfx.js';

const normalize = (value) => value.replace(/\s+/g, '');

export default class Level1Scene extends Phaser.Scene {
  constructor() {
    super('Level1Scene');
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);
    ScoreManager.resetLevelScore();
    HintManager.resetCooldown();
    this.state = { phase: 'narrative', step: 0, mode: 'words', wordIndex: 0, solved: 0, tokens: [], busy: false };
    this.elapsed = 0;
    this.hintInterval = null;
    this.typewriterInterval = null;

    const save = SaveManager.load();
    save.lastActiveScene = 'Level1Scene';
    SaveManager.save(save);

    this.gameContainer = document.getElementById('wasis-aksara-game')?.parentElement;
    if (this.gameContainer) {
      this.gameContainer.style.backgroundImage = "url('/assets/images/Bg_CandiTikusNew.png')";
      this.gameContainer.style.backgroundSize = 'cover';
      this.gameContainer.style.backgroundPosition = 'center';
    }

    this.uiContainer = document.getElementById('ui-overlay-container');
    if (this.uiContainer) this.uiContainer.innerHTML = level1Template;
    this.$ = (id) => document.getElementById(id);
    this.cacheElements();
    this.els['level1-overlay']?.classList.remove('hidden');
    this.buildPalette();
    this.buildWordChips();
    this.bindEvents();
    this.updateHud();

    this.time.delayedCall(150, () => this.els['l1-hud']?.classList.replace('opacity-0', 'opacity-100'));
    this.time.delayedCall(400, () => this.showNarrative(0));
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.updateTime() });
    this.events.once('shutdown', () => this.cleanup());
  }

  cacheElements() {
    const ids = ['level1-overlay', 'l1-hud', 'l1-time-val', 'l1-score-val', 'l1-progress-val', 'l1-btn-exit', 'l1-dialog', 'l1-dialog-text', 'l1-dialog-next', 'l1-dialog-next-label', 'l1-ornament', 'l1-gate-glow', 'l1-board', 'l1-board-title', 'l1-board-step', 'l1-target-label', 'l1-target-latin', 'l1-wordchips', 'l1-answer-box', 'l1-answer', 'l1-board-msg', 'l1-palette-legena', 'l1-palette-sandhangan', 'l1-palette-pasangan', 'l1-btn-space', 'l1-btn-backspace', 'l1-btn-clear', 'l1-btn-hint', 'l1-hint-label', 'l1-btn-submit', 'l1-hint-preview', 'l1-hint-preview-text', 'l1-sentence-intro', 'l1-btn-open-sentence', 'l1-reward', 'l1-btn-claim'];
    this.els = Object.fromEntries(ids.map((id) => [id, this.$(id)]));
  }

  buildPalette() {
    const addKey = (container, [glyph, label]) => {
      const button = document.createElement('button');
      button.className = 'wa-key';
      button.innerHTML = `<span class="wa-glyph">${glyph}</span><span class="wa-latin">${label}</span>`;
      button.onclick = () => {
        if (this.state.phase !== 'board' || this.state.busy) return;
        this.state.tokens.push(glyph);
        sfxWrite();
        this.updateAnswer();
      };
      container.appendChild(button);
    };
    level1Data.palette.legena.forEach((item) => addKey(this.els['l1-palette-legena'], item));
    level1Data.palette.sandhangan.forEach((item) => addKey(this.els['l1-palette-sandhangan'], item));
    level1Data.palette.pasangan.forEach((item) => addKey(this.els['l1-palette-pasangan'], item));
  }

  buildWordChips() {
    level1Data.words.forEach((word, index) => {
      const chip = document.createElement('span');
      chip.id = `l1-chip-${index}`;
      chip.className = 'wa-chip';
      chip.textContent = word.latin;
      this.els['l1-wordchips'].appendChild(chip);
    });
  }

  bindEvents() {
    this.els['l1-dialog-next'].onclick = () => this.nextNarrative();
    this.els['l1-ornament'].onclick = () => this.openWordsBoard();
    this.els['l1-btn-space'].onclick = () => this.addToken(' ');
    this.els['l1-btn-backspace'].onclick = () => { this.state.tokens.pop(); this.updateAnswer(); };
    this.els['l1-btn-clear'].onclick = () => { this.state.tokens = []; this.updateAnswer(); };
    this.els['l1-btn-submit'].onclick = () => this.submitAnswer();
    this.els['l1-btn-hint'].onclick = () => this.useHint();
    this.els['l1-btn-open-sentence'].onclick = () => {
      this.hideModal(this.els['l1-sentence-intro']);
      this.openBoard('sentence');
    };
    this.els['l1-btn-claim'].onclick = () => this.claimReward();
    this.els['l1-btn-exit'].onclick = () => this.leaveToMap();
    this.boundElements = Object.values(this.els).filter(Boolean);
  }

  showNarrative(step) {
    this.state.step = step;
    this.state.phase = 'narrative';
    const dialog = this.els['l1-dialog'];
    dialog.classList.remove('hidden');
    dialog.classList.add('flex');
    this.els['l1-dialog-next-label'].textContent = step === level1Data.narrative.length - 1 ? 'MULAI' : 'LANJUT';
    this.typeText(level1Data.narrative[step]);
    speakNarration(level1Data.narrative[step]);
    this.fadeIn(dialog);
  }

  typeText(text) {
    clearInterval(this.typewriterInterval);
    this.els['l1-dialog-text'].textContent = '';
    let index = 0;
    this.typewriterInterval = setInterval(() => {
      this.els['l1-dialog-text'].textContent += text[index++];
      if (index >= text.length) {
        clearInterval(this.typewriterInterval);
        this.typewriterInterval = null;
      }
    }, 22);
  }

  nextNarrative() {
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
      this.els['l1-dialog-text'].textContent = level1Data.narrative[this.state.step];
      return;
    }
    if (this.state.step < level1Data.narrative.length - 1) {
      this.showNarrative(this.state.step + 1);
      return;
    }
    stopNarration();
    this.state.phase = 'transition';
    this.fadeOut(this.els['l1-dialog'], true);
    sfxOpen();
    this.time.delayedCall(500, () => {
      this.state.phase = 'explore';
      this.els['l1-ornament'].classList.remove('hidden');
    });
  }

  openWordsBoard() {
    if (this.state.phase !== 'explore') return;
    this.openBoard('words');
  }

  openBoard(mode) {
    this.state.phase = 'board';
    this.state.mode = mode;
    this.state.busy = false;
    this.state.tokens = [];
    const sentence = mode === 'sentence';
    this.els['l1-board-title'].textContent = sentence ? 'Tantangan 2 — Nulis Ukara' : 'Tantangan 1 — Mbuka Dalan';
    this.els['l1-target-label'].textContent = sentence ? 'Tulisen ukara iki:' : 'Tulisen ing Aksara Jawa:';
    this.els['l1-target-latin'].textContent = sentence ? level1Data.sentence.latin : level1Data.words[this.state.wordIndex].latin;
    this.els['l1-target-latin'].style.fontSize = sentence ? '13px' : '21px';
    this.els['l1-wordchips'].classList.toggle('hidden', sentence);
    this.els['l1-board-step'].textContent = sentence ? 'Ukara' : `Tembung ${this.state.wordIndex + 1} / 4`;
    this.updateChipStates();
    this.updateAnswer();
    const board = this.els['l1-board'];
    board.classList.remove('hidden');
    requestAnimationFrame(() => board.classList.remove('translate-y-full'));
    sfxOpen();
  }

  updateChipStates() {
    level1Data.words.forEach((_, index) => {
      const chip = this.$(`l1-chip-${index}`);
      chip.classList.toggle('wa-chip-active', this.state.mode === 'words' && index === this.state.wordIndex);
      chip.classList.toggle('wa-chip-done', index < this.state.solved);
    });
  }

  addToken(token) {
    if (this.state.phase !== 'board' || this.state.busy) return;
    this.state.tokens.push(token);
    this.updateAnswer();
  }

  updateAnswer() {
    this.els['l1-answer'].textContent = this.state.tokens.join('');
  }

  submitAnswer() {
    if (this.state.phase !== 'board' || this.state.busy) return;
    const target = this.state.mode === 'sentence' ? level1Data.sentence.aksara : level1Data.words[this.state.wordIndex].aksara;
    const answer = this.state.tokens.join('');
    if (!answer) return this.wrongAnswer('Isian isih kosong.');
    if (normalize(answer) !== normalize(target)) return this.wrongAnswer('Durung bener, coba maneh.');
    this.correctAnswer();
  }

  wrongAnswer(message) {
    ScoreManager.addWrongAnswer();
    sfxError();
    this.els['l1-board-msg'].textContent = message;
    this.els['l1-board-msg'].className = 'mt-1 h-[16px] font-poppins text-[11px] font-semibold text-state-error';
    this.els['l1-answer-box'].classList.remove('animate-wa-shake');
    void this.els['l1-answer-box'].offsetWidth;
    this.els['l1-answer-box'].classList.add('animate-wa-shake');
  }

  correctAnswer() {
    this.state.busy = true;
    sfxSuccess();
    ScoreManager.addCorrectAnswer();
    this.els['l1-board-msg'].textContent = 'Sagestremen! Jawabanmu bener.';
    this.els['l1-board-msg'].className = 'mt-1 h-[16px] font-poppins text-[11px] font-semibold text-state-success';
    this.updateHud();

    if (this.state.mode === 'sentence') {
      ScoreManager.addBonus(400);
      this.updateHud();
      this.time.delayedCall(700, () => {
        this.closeBoard();
        this.time.delayedCall(550, () => this.showReward());
      });
      return;
    }

    const index = this.state.wordIndex;
    this.state.solved += 1;
    this.updateHud();
    if (this.state.solved < level1Data.words.length) {
      this.time.delayedCall(700, () => {
        this.state.wordIndex = this.state.solved;
        this.state.tokens = [];
        this.els['l1-target-latin'].textContent = level1Data.words[this.state.wordIndex].latin;
        this.els['l1-board-step'].textContent = `Tembung ${this.state.wordIndex + 1} / 4`;
        this.updateChipStates();
        this.updateAnswer();
        this.state.busy = false;
      });
    } else {
      this.time.delayedCall(900, () => {
        this.closeBoard();
        this.completePath();
      });
    }
  }

  completePath() {
    this.state.phase = 'path';
    this.els['l1-ornament'].classList.add('opacity-40');
    this.els['l1-ornament'].disabled = true;
    this.time.delayedCall(300, () => {
      this.els['l1-gate-glow'].classList.remove('hidden');
      this.cameras.main.flash(450, 242, 210, 138);
      sfxReward();
      this.time.delayedCall(1500, () => this.showSentenceIntro());
    });
  }

  showSentenceIntro() {
    this.state.phase = 'intro';
    this.showModal(this.els['l1-sentence-intro']);
  }

  useHint() {
    if (this.state.phase !== 'board' || !HintManager.triggerHint()) return;
    const target = this.state.mode === 'sentence' ? level1Data.sentence.aksara : level1Data.words[this.state.wordIndex].aksara;
    this.els['l1-hint-preview-text'].textContent = target;
    this.els['l1-hint-preview'].classList.remove('hidden');
    this.time.delayedCall(4000, () => this.els['l1-hint-preview'].classList.add('hidden'));
    clearInterval(this.hintInterval);
    this.hintInterval = setInterval(() => {
      const remaining = HintManager.getRemainingCooldown();
      this.els['l1-hint-label'].textContent = remaining ? `${remaining}s` : '';
      if (!remaining) clearInterval(this.hintInterval);
    }, 500);
  }

  showReward() {
    this.state.phase = 'reward';
    sfxReward();
    this.showModal(this.els['l1-reward']);
  }

  claimReward() {
    const save = SaveManager.load();
    save.artifacts ||= [];
    if (!save.artifacts.includes(level1Data.reward.id)) save.artifacts.push(level1Data.reward.id);
    SaveManager.save(save);
    const targetScore = levelData.find((item) => item.level === 1)?.targetScore || 1000;
    const score = ScoreManager.currentScore;
    const stars = ScoreManager.calculateStars(score, targetScore);
    this.state.phase = 'finished';
    this.els['level1-overlay'].style.opacity = '0';
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('ResultScene', { level: 1, score, stars }));
  }

  leaveToMap() {
    if (this.state.phase === 'finished') return;
    stopNarration();
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('MapScene'));
  }

  showModal(element) {
    element.classList.remove('hidden');
    element.classList.add('flex');
    requestAnimationFrame(() => element.classList.replace('opacity-0', 'opacity-100'));
  }

  hideModal(element) {
    element.classList.replace('opacity-100', 'opacity-0');
    this.time.delayedCall(300, () => { element.classList.add('hidden'); element.classList.remove('flex'); });
  }

  closeBoard() {
    this.els['l1-board'].classList.add('translate-y-full');
    this.time.delayedCall(500, () => this.els['l1-board'].classList.add('hidden'));
  }

  fadeIn(element) { requestAnimationFrame(() => element.classList.replace('opacity-0', 'opacity-100')); }
  fadeOut(element, hide = false) {
    element.classList.replace('opacity-100', 'opacity-0');
    if (hide) this.time.delayedCall(500, () => { element.classList.add('hidden'); element.classList.remove('flex'); });
  }

  updateHud() {
    this.els?.['l1-score-val'] && (this.els['l1-score-val'].textContent = ScoreManager.currentScore);
    this.els?.['l1-progress-val'] && (this.els['l1-progress-val'].textContent = `${this.state?.solved || 0} / 4`);
  }

  updateTime() {
    this.elapsed += 1;
    const minutes = String(Math.floor(this.elapsed / 60)).padStart(2, '0');
    const seconds = String(this.elapsed % 60).padStart(2, '0');
    if (this.els?.['l1-time-val']) this.els['l1-time-val'].textContent = `${minutes}:${seconds}`;
  }

  cleanup() {
    stopNarration();
    clearInterval(this.typewriterInterval);
    clearInterval(this.hintInterval);
    this.boundElements?.forEach((element) => { element.onclick = null; });
    if (this.uiContainer) this.uiContainer.innerHTML = '';
    if (this.gameContainer) this.gameContainer.style.backgroundImage = 'none';
  }
}

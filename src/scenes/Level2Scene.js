import Phaser from 'phaser';
import SaveManager from '../managers/SaveManager.js';
import ScoreManager from '../managers/ScoreManager.js';
import { level2Data } from '../data/level2Data.js';
import level2Template from '../templates/Level2Overlay.html?raw';
import { addAudioToggle, confirmLeaveLevel, showFeedback, showHistoryPopup } from '../ui/overlayKit.js';
import { isSameAksara } from '../utils/aksara.js';
import { sfxOpen, sfxWrite } from '../utils/sfx.js';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

const SENTENCES = level2Data.sentences;
const DRAG_THRESHOLD = 6;

/**
 * Level2Scene: "Ndandani Prasasti Kuno".
 * Alur: sejarah candi → kothak prasasti dibukak → perintah → gulungan 5 ukara rumpang
 *       → ukara siji-siji: seret (utawa klik) aksara menyang papan kosong → Priksa → papan skor.
 */
export default class Level2Scene extends Phaser.Scene {
  constructor() {
    super('Level2Scene');
  }

  create() {
    fadeTransitionIn(this, 500);
    ScoreManager.resetLevelScore();
    this.state = { phase: 'history', index: 0, placed: null, busy: false, timerRunning: false };
    this.answers = [];
    this.elapsed = 0;
    this.drag = null;

    const save = SaveManager.load();
    save.lastActiveScene = 'Level2Scene';
    SaveManager.save(save);

    this.gameContainer = document.getElementById('wasis-aksara-game')?.parentElement;
    if (this.gameContainer) {
      this.gameContainer.style.backgroundImage = "linear-gradient(rgba(20,14,8,.45), rgba(20,14,8,.45)), url('/assets/images/Bg_CandiTikusNew.webp')";
      this.gameContainer.style.backgroundSize = 'cover';
      this.gameContainer.style.backgroundPosition = 'center';
    }

    this.uiContainer = document.getElementById('ui-overlay-container');
    if (this.uiContainer) this.uiContainer.innerHTML = level2Template;
    this.$ = (id) => document.getElementById(id);
    const ids = ['level2-overlay', 'l2-hud', 'l2-time-val', 'l2-progress-val', 'l2-score-val', 'l2-btn-exit', 'l2-chest-stage', 'l2-chest-glow', 'l2-chest', 'l2-chest-hint', 'l2-command', 'l2-command-title', 'l2-command-text', 'l2-btn-command-next', 'l2-scroll', 'l2-scroll-list', 'l2-btn-scroll-next', 'l2-puzzle', 'l2-step', 'l2-sentence', 'l2-latin', 'l2-options', 'l2-btn-reset', 'l2-btn-check'];
    this.els = Object.fromEntries(ids.map((id) => [id, this.$(id)]));
    this.els['level2-overlay'].classList.remove('hidden');

    this.els['l2-command-title'].textContent = level2Data.command.title;
    this.els['l2-command-text'].textContent = level2Data.command.text;
    this.buildScrollList();
    this.bindEvents();
    this.updateHud();

    this.time.delayedCall(150, () => this.els['l2-hud'].classList.replace('opacity-0', 'opacity-100'));
    this.time.delayedCall(400, async () => {
      await showHistoryPopup(2);
      if (this.sys.isActive()) this.showChest();
    });
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.updateTime() });
    this.events.once('shutdown', () => this.cleanup());
  }

  bindEvents() {
    this.els['l2-chest'].onclick = () => this.openChest();
    this.els['l2-btn-command-next'].onclick = () => this.showScroll();
    this.els['l2-btn-scroll-next'].onclick = () => this.startPuzzle();
    this.els['l2-btn-reset'].onclick = () => this.clearSlot();
    this.els['l2-btn-check'].onclick = () => this.checkAnswer();
    this.els['l2-btn-exit'].onclick = () => this.leaveToMap();
    addAudioToggle(this.els['l2-btn-exit']);
    this.boundElements = Object.values(this.els);
  }

  // ─── 1–3. Kothak prasasti → perintah → gulungan ─────────────────────────────

  showChest() {
    this.state.phase = 'chest';
    this.fadeIn(this.els['l2-chest-stage']);
  }

  openChest() {
    if (this.state.phase !== 'chest') return;
    this.state.phase = 'opening';
    this.els['l2-chest'].classList.add('is-open');
    this.els['l2-chest-glow'].classList.replace('opacity-0', 'opacity-100');
    this.els['l2-chest-hint'].classList.add('invisible');
    sfxOpen();
    this.time.delayedCall(1000, () => this.showModal(this.els['l2-command']));
  }

  showScroll() {
    this.hideModal(this.els['l2-command']);
    this.time.delayedCall(320, () => {
      this.state.phase = 'scroll';
      this.showModal(this.els['l2-scroll']);
      sfxOpen();
    });
  }

  /** Gulungan berisi kelima ukara rumpang (aksara + Latin) sebagai gambaran awal. */
  buildScrollList() {
    SENTENCES.forEach((sentence, index) => {
      const item = document.createElement('li');
      item.className = 'flex items-center gap-4 border-b border-[#b9975a]/50 pb-2 last:border-0';
      item.innerHTML = `
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#6b4a22] font-cinzel text-[14px] font-bold text-[#4a2f14]">${index + 1}</span>
        <div class="flex flex-col">
          <p class="whitespace-nowrap font-local-javanese pb-3 pt-1 text-[26px] leading-none text-[#3a2410]" data-slot="aksara"></p>
          <p class="font-poppins text-[12px] font-semibold text-[#6b4a22]" data-slot="latin"></p>
        </div>`;
      const aksara = item.querySelector('[data-slot="aksara"]');
      aksara.append(sentence.before, this.blankBox('mx-2 inline-block h-8 w-20 rounded-md border-2 border-dashed border-[#8b6a2b] align-middle'), sentence.after);
      const latin = item.querySelector('[data-slot="latin"]');
      latin.append(sentence.latin[0], this.blankBox('mx-1 inline-block w-16 border-b-2 border-dashed border-[#8b6a2b]'), sentence.latin[1]);
      this.els['l2-scroll-list'].appendChild(item);
    });
  }

  blankBox(className) {
    const box = document.createElement('span');
    box.className = className;
    return box;
  }

  // ─── 4. Ndandani ukara siji-siji ────────────────────────────────────────────

  startPuzzle() {
    if (this.state.phase !== 'scroll') return;
    this.state.phase = 'puzzle';
    this.state.timerRunning = true;
    this.hideModal(this.els['l2-scroll']);
    this.fadeOut(this.els['l2-chest-stage'], true);
    const puzzle = this.els['l2-puzzle'];
    puzzle.classList.replace('hidden', 'flex');
    this.fadeIn(puzzle);
    this.showSentence(0);
  }

  showSentence(index) {
    const sentence = SENTENCES[index];
    this.state.index = index;
    this.state.placed = null;
    this.state.busy = false;
    this.els['l2-step'].textContent = `Ukara ${index + 1} / ${SENTENCES.length}`;

    this.slot = document.createElement('span');
    this.slot.className = 'l2-slot';
    this.slot.onclick = () => this.clearSlot();
    this.els['l2-sentence'].replaceChildren(sentence.before, this.slot, sentence.after);

    const target = document.createElement('span');
    target.className = 'mx-1 rounded-md border-b-2 border-dashed border-[#2c2924] bg-[#2c2924]/10 px-2';
    target.textContent = sentence.latinAnswer;
    this.els['l2-latin'].replaceChildren(sentence.latin[0], target, sentence.latin[1]);

    const options = Phaser.Utils.Array.Shuffle([sentence.answer, ...sentence.distractors]);
    this.els['l2-options'].replaceChildren(...options.map((value) => this.createTile(value)));
    this.updateButtons();
  }

  createTile(value) {
    const tile = document.createElement('button');
    tile.className = 'l2-tile animate-wa-pop';
    tile.textContent = value;
    tile.dataset.value = value;
    // Animasi muncul (fill-mode both) menahan opacity, jadi dilepas agar status `is-used` terlihat
    tile.addEventListener('animationend', () => tile.classList.remove('animate-wa-pop'), { once: true });
    tile.addEventListener('pointerdown', (event) => this.onTileDown(event, tile));
    tile.addEventListener('pointermove', (event) => this.onTileMove(event));
    tile.addEventListener('pointerup', (event) => this.onTileUp(event));
    tile.addEventListener('pointercancel', () => this.endDrag());
    return tile;
  }

  /** Posisi pointer dalam koordinat kanvas UI 1280×720 (overlay di-skala sesuai layar). */
  toLocal(event) {
    const rect = this.uiContainer.getBoundingClientRect();
    const scale = rect.width / 1280;
    return { x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale };
  }

  isOverSlot(event) {
    const rect = this.slot.getBoundingClientRect();
    const margin = 24;
    return event.clientX >= rect.left - margin && event.clientX <= rect.right + margin
      && event.clientY >= rect.top - margin && event.clientY <= rect.bottom + margin;
  }

  onTileDown(event, tile) {
    if (this.state.phase !== 'puzzle' || this.state.busy) return;
    event.preventDefault();
    tile.setPointerCapture(event.pointerId);
    this.drag = { tile, startX: event.clientX, startY: event.clientY, ghost: null };
  }

  onTileMove(event) {
    if (!this.drag) return;
    const moved = Math.hypot(event.clientX - this.drag.startX, event.clientY - this.drag.startY);
    if (!this.drag.ghost && moved < DRAG_THRESHOLD) return;
    if (!this.drag.ghost) {
      this.drag.ghost = this.drag.tile.cloneNode(true);
      this.drag.ghost.classList.remove('animate-wa-pop');
      this.drag.ghost.classList.add('l2-ghost');
      this.els['level2-overlay'].appendChild(this.drag.ghost);
      this.drag.tile.classList.add('opacity-40');
    }
    const point = this.toLocal(event);
    Object.assign(this.drag.ghost.style, { left: `${point.x}px`, top: `${point.y}px` });
    this.slot.classList.toggle('is-over', this.isOverSlot(event));
  }

  onTileUp(event) {
    if (!this.drag) return;
    const { tile, ghost } = this.drag;
    // Klik tanpa seret = langsung pasang; seret = pasang hanya jika dilepas di atas papan kosong
    if (!ghost || this.isOverSlot(event)) this.placeTile(tile);
    this.endDrag();
  }

  endDrag() {
    if (!this.drag) return;
    this.drag.ghost?.remove();
    this.drag.tile.classList.remove('opacity-40');
    this.slot?.classList.remove('is-over');
    this.drag = null;
  }

  placeTile(tile) {
    if (this.state.busy) return;
    this.state.placed?.classList.remove('is-used');
    this.state.placed = tile;
    tile.classList.add('is-used');
    this.slot.textContent = tile.dataset.value;
    this.slot.classList.add('is-filled');
    sfxWrite();
    this.updateButtons();
  }

  clearSlot() {
    if (this.state.busy || !this.state.placed) return;
    this.state.placed.classList.remove('is-used');
    this.state.placed = null;
    this.slot.textContent = '';
    this.slot.classList.remove('is-filled');
    this.updateButtons();
  }

  updateButtons() {
    const empty = !this.state.placed || this.state.busy;
    this.els['l2-btn-check'].disabled = empty;
    this.els['l2-btn-reset'].disabled = empty;
  }

  async checkAnswer() {
    if (this.state.phase !== 'puzzle' || this.state.busy || !this.state.placed) return;
    this.state.busy = true;
    this.updateButtons();
    const sentence = SENTENCES[this.state.index];
    const value = this.state.placed.dataset.value;
    const correct = isSameAksara(value, sentence.answer);
    this.slot.classList.add(correct ? 'is-correct' : 'is-wrong');
    this.answers.push({
      question: `${sentence.latin[0]}____${sentence.latin[1]} (${sentence.latinAnswer})`,
      playerAnswer: value,
      correctAnswer: sentence.answer,
      correct
    });
    if (correct) ScoreManager.addBonus(level2Data.scoring.correct);
    this.updateHud();

    await showFeedback(correct);
    if (!this.sys.isActive()) return;
    if (this.state.index < SENTENCES.length - 1) this.showSentence(this.state.index + 1);
    else this.finishLevel();
  }

  finishLevel() {
    this.state.phase = 'finished';
    this.state.timerRunning = false;
    const correctCount = this.answers.filter((answer) => answer.correct).length;
    const score = ScoreManager.currentScore;
    const stars = ScoreManager.starsFromCorrect(correctCount, SENTENCES.length);
    this.els['level2-overlay'].style.opacity = '0';
    fadeTransitionOut(this, 500, () => this.scene.start('ResultScene', { level: 2, score, stars, answers: this.answers }));
  }

  async leaveToMap() {
    if (this.state.phase === 'finished' || this.confirmingLeave) return;
    this.confirmingLeave = true;
    const confirmed = await confirmLeaveLevel();
    this.confirmingLeave = false;
    if (!confirmed || this.state.phase === 'finished') return;
    this.state.phase = 'finished';
    fadeTransitionOut(this, 350, () => this.scene.start('MapScene'));
  }

  // ─── Utilitas UI ────────────────────────────────────────────────────────────

  showModal(element) {
    element.classList.remove('hidden');
    element.classList.add('flex');
    requestAnimationFrame(() => element.classList.replace('opacity-0', 'opacity-100'));
  }

  hideModal(element) {
    element.classList.replace('opacity-100', 'opacity-0');
    this.time.delayedCall(300, () => { element.classList.add('hidden'); element.classList.remove('flex'); });
  }

  fadeIn(element) { requestAnimationFrame(() => element.classList.replace('opacity-0', 'opacity-100')); }
  fadeOut(element, hide = false) {
    element.classList.replace('opacity-100', 'opacity-0');
    if (hide) this.time.delayedCall(500, () => { element.classList.add('hidden'); element.classList.remove('flex'); });
  }

  updateHud() {
    this.els['l2-score-val'].textContent = ScoreManager.currentScore;
    this.els['l2-progress-val'].textContent = `${this.answers.length} / ${SENTENCES.length}`;
  }

  updateTime() {
    if (!this.state.timerRunning) return;
    this.elapsed += 1;
    const minutes = String(Math.floor(this.elapsed / 60)).padStart(2, '0');
    const seconds = String(this.elapsed % 60).padStart(2, '0');
    this.els['l2-time-val'].textContent = `${minutes}:${seconds}`;
  }

  cleanup() {
    this.endDrag();
    this.boundElements?.forEach((element) => { if (element) element.onclick = null; });
    if (this.uiContainer) this.uiContainer.innerHTML = '';
    if (this.gameContainer) this.gameContainer.style.backgroundImage = 'none';
  }
}

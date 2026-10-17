import Phaser from 'phaser';
import SaveManager from '../managers/SaveManager.js';
import ScoreManager from '../managers/ScoreManager.js';
import { level4Data } from '../data/level4Data.js';
import level4Template from '../templates/Level4Overlay.html?raw';
import { createAksaraKeyboard } from '../ui/aksaraKeyboard.js';
import { showFeedback, showHistoryPopup, showKeyboardTutorial } from '../ui/overlayKit.js';
import { isSameAksara, splitAksara } from '../utils/aksara.js';
import { sfxError, sfxOpen, sfxWrite } from '../utils/sfx.js';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

const DIR_LABEL = { across: 'Mendatar', down: 'Menurun' };

/**
 * Level4Scene: "TTS Aksara Jawa".
 * Alur: sejarah candi → langsung TTS 10 pitakon. Pilih pitakon/kothak → ketik tembung
 *       (kothak keisi per suku kata) → Priksa (sepisan) → wangsulan bener ditampilake ing grid
 *       → papan skor → mahkota → rekap petualangan (EndingScene).
 */
export default class Level4Scene extends Phaser.Scene {
  constructor() {
    super('Level4Scene');
  }

  create() {
    fadeTransitionIn(this, 500);
    ScoreManager.resetLevelScore();
    this.state = { phase: 'history', selected: null, busy: false, timerRunning: false };
    this.answers = [];
    this.elapsed = 0;
    this.words = this.buildWords();

    const save = SaveManager.load();
    save.lastActiveScene = 'Level4Scene';
    SaveManager.save(save);

    this.gameContainer = document.getElementById('wasis-aksara-game')?.parentElement;
    if (this.gameContainer) {
      this.gameContainer.style.backgroundImage = "linear-gradient(rgba(20,14,8,.55), rgba(20,14,8,.55)), url('/assets/images/Bg_CandiTikusNew.webp')";
      this.gameContainer.style.backgroundSize = 'cover';
      this.gameContainer.style.backgroundPosition = 'center';
    }

    this.uiContainer = document.getElementById('ui-overlay-container');
    if (this.uiContainer) this.uiContainer.innerHTML = level4Template;
    const ids = ['level4-overlay', 'l4-hud', 'l4-time-val', 'l4-progress-val', 'l4-score-val', 'l4-btn-exit', 'l4-board', 'l4-grid', 'l4-clues-across', 'l4-clues-down', 'l4-kb-panel', 'l4-selected-label', 'l4-selected-clue', 'l4-count', 'l4-preview', 'l4-kb-mount', 'l4-btn-help', 'l4-btn-check'];
    this.els = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
    this.els['level4-overlay'].classList.remove('hidden');

    this.buildGrid();
    this.buildClues();
    this.keyboard = createAksaraKeyboard({ onChange: (value) => this.onTyped(value) });
    this.els['l4-kb-mount'].appendChild(this.keyboard.element);
    this.els['l4-btn-help'].onclick = () => showKeyboardTutorial();
    this.els['l4-btn-check'].onclick = () => this.checkAnswer();
    this.els['l4-btn-exit'].onclick = () => this.leaveToMap();
    this.updateHud();

    this.time.delayedCall(150, () => this.els['l4-hud'].classList.replace('opacity-0', 'opacity-100'));
    this.time.delayedCall(400, async () => {
      await showHistoryPopup(4);
      if (this.sys.isActive()) this.startPuzzle();
    });
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.updateTime() });
    this.events.once('shutdown', () => this.cleanup());
  }

  /** Tembung + kotak-kotaknya, serta nomor TTS (urut baris lalu kolom seperti TTS biasa). */
  buildWords() {
    const words = level4Data.words.map((word) => {
      const clusters = splitAksara(word.answer);
      const cells = clusters.map((_, i) => `${word.row + (word.dir === 'down' ? i : 0)},${word.col + (word.dir === 'across' ? i : 0)}`);
      return { ...word, clusters, cells, status: null };
    });
    const starts = [...new Set(words.map((word) => word.cells[0]))]
      .sort((a, b) => { const [ra, ca] = a.split(',').map(Number); const [rb, cb] = b.split(',').map(Number); return ra - rb || ca - cb; });
    words.forEach((word) => { word.number = starts.indexOf(word.cells[0]) + 1; });
    return words;
  }

  buildGrid() {
    const { width, height } = level4Data;
    const grid = this.els['l4-grid'];
    grid.style.gridTemplateColumns = `repeat(${width}, 46px)`;
    this.cellEls = new Map();
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        const key = `${row},${col}`;
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'l4-cell';
        const owners = this.words.filter((word) => word.cells.includes(key));
        if (!owners.length) {
          cell.classList.add('is-empty');
          cell.tabIndex = -1;
        } else {
          const starter = owners.find((word) => word.cells[0] === key);
          if (starter) cell.innerHTML = `<span class="l4-num">${starter.number}</span>`;
          cell.appendChild(document.createElement('span'));
          cell.onclick = () => this.onCellClick(key);
          this.cellEls.set(key, cell);
        }
        grid.appendChild(cell);
      }
    }
  }

  buildClues() {
    const ordered = [...this.words].sort((a, b) => a.number - b.number);
    ordered.forEach((word) => {
      const item = document.createElement('li');
      item.className = 'l4-clue';
      item.innerHTML = `<b>${word.number}.</b><span></span>`;
      item.querySelector('span').textContent = `${word.clue} (${word.clusters.length})`;
      item.onclick = () => this.selectWord(word);
      word.clueEl = item;
      this.els[word.dir === 'across' ? 'l4-clues-across' : 'l4-clues-down'].appendChild(item);
    });
  }

  startPuzzle() {
    this.state.phase = 'puzzle';
    this.state.timerRunning = true;
    this.fadeIn(this.els['l4-board']);
    requestAnimationFrame(() => this.els['l4-kb-panel'].classList.remove('translate-y-full'));
    sfxOpen();
    this.selectWord(this.nextOpenWord());
  }

  nextOpenWord(after = null) {
    const ordered = [...this.words].sort((a, b) => (a.dir === b.dir ? a.number - b.number : a.dir === 'across' ? -1 : 1));
    const start = after ? ordered.indexOf(after) + 1 : 0;
    return [...ordered.slice(start), ...ordered.slice(0, start)].find((word) => !word.status) || null;
  }

  // ─── Milih tembung ─────────────────────────────────────────────────────────

  onCellClick(key) {
    if (this.state.phase !== 'puzzle' || this.state.busy) return;
    const open = this.words.filter((word) => !word.status && word.cells.includes(key));
    if (!open.length) return;
    // Klik ulang kotak persilangan = ganti arah
    const current = open.indexOf(this.state.selected);
    this.selectWord(open[(current + 1) % open.length]);
  }

  selectWord(word) {
    if (!word || word.status || this.state.busy || this.state.phase !== 'puzzle') return;
    this.state.selected = word;
    this.words.forEach((item) => item.clueEl.classList.toggle('is-active', item === word));
    this.cellEls.forEach((cell, key) => cell.classList.toggle('is-active', word.cells.includes(key)));
    this.els['l4-selected-label'].textContent = `${word.number} ${DIR_LABEL[word.dir]} · ${word.clusters.length} kothak`;
    this.els['l4-selected-clue'].textContent = word.clue;
    this.keyboard.clear();
    sfxWrite();
  }

  /** Ketikan langsung mengisi kotak tembung terpilih per suku kata (kotak yang sudah terjawab tetap). */
  onTyped(value) {
    const word = this.state.selected;
    this.els['l4-preview'].textContent = value;
    this.renderCells();
    if (word) {
      const typed = splitAksara(value);
      word.cells.forEach((key, i) => {
        if (!this.isRevealed(key)) this.setCellText(key, typed[i] || '');
      });
      const count = typed.length;
      this.els['l4-count'].textContent = `${count} / ${word.clusters.length} kothak`;
      this.els['l4-count'].className = `font-poppins text-[10px] font-bold ${count === word.clusters.length ? 'text-state-success' : count > word.clusters.length ? 'text-state-error' : 'text-stone-soft/70'}`;
    }
    this.els['l4-btn-check'].disabled = !value || this.state.busy || !word;
  }

  isRevealed(key) {
    return this.words.some((word) => word.status && word.cells.includes(key));
  }

  setCellText(key, text) {
    this.cellEls.get(key).lastElementChild.textContent = text;
  }

  /** Kotak yang belum terjawab dikosongkan; yang sudah terjawab menampilkan wangsulan bener. */
  renderCells() {
    this.cellEls.forEach((_, key) => { if (!this.isRevealed(key)) this.setCellText(key, ''); });
  }

  // ─── Priksa ────────────────────────────────────────────────────────────────

  async checkAnswer() {
    const word = this.state.selected;
    if (this.state.phase !== 'puzzle' || this.state.busy || !word || !this.keyboard.value) return;
    const typed = this.keyboard.value;
    if (splitAksara(typed).length !== word.clusters.length) {
      sfxError();
      this.els['l4-count'].textContent = `Kudu ${word.clusters.length} kothak!`;
      this.els['l4-count'].className = 'font-poppins text-[10px] font-bold text-state-error animate-wa-shake';
      return;
    }

    this.state.busy = true;
    this.keyboard.setDisabled(true);
    this.els['l4-btn-check'].disabled = true;
    const correct = isSameAksara(typed, word.answer, { ignorePada: true });
    word.status = correct ? 'correct' : 'wrong';
    this.answers.push({
      question: `${word.number} ${DIR_LABEL[word.dir]}: ${word.clue} (${word.latin})`,
      playerAnswer: typed,
      correctAnswer: word.answer,
      correct
    });
    if (correct) ScoreManager.addBonus(level4Data.scoring.correct);
    else ScoreManager.addWrongAnswer();

    // Tampilkan wangsulan bener; kotak hijau tidak diturunkan jadi merah oleh tembung lain
    word.cells.forEach((key, i) => {
      const cell = this.cellEls.get(key);
      this.setCellText(key, word.clusters[i]);
      cell.classList.remove('is-active');
      if (correct) {
        cell.classList.remove('is-wrong');
        cell.classList.add('is-correct');
      } else if (!cell.classList.contains('is-correct')) {
        cell.classList.add('is-wrong');
      }
    });
    word.clueEl.classList.remove('is-active');
    word.clueEl.classList.add(correct ? 'is-correct' : 'is-wrong');
    this.updateHud();

    await showFeedback(correct);
    if (!this.sys.isActive()) return;
    this.state.busy = false;
    this.keyboard.setDisabled(false);
    const next = this.nextOpenWord(word);
    if (next) this.selectWord(next);
    else this.finishLevel();
  }

  finishLevel() {
    this.state.phase = 'finished';
    this.state.timerRunning = false;
    this.els['l4-kb-panel'].classList.add('translate-y-full');
    const correctCount = this.answers.filter((answer) => answer.correct).length;
    const score = ScoreManager.currentScore;
    const stars = ScoreManager.starsFromCorrect(correctCount, this.words.length);
    this.time.delayedCall(900, () => {
      this.els['level4-overlay'].style.opacity = '0';
      fadeTransitionOut(this, 500, () => this.scene.start('ResultScene', { level: 4, score, stars, answers: this.answers }));
    });
  }

  leaveToMap() {
    if (this.state.phase === 'finished') return;
    this.state.phase = 'finished';
    fadeTransitionOut(this, 350, () => this.scene.start('MapScene'));
  }

  // ─── Utilitas UI ────────────────────────────────────────────────────────────

  fadeIn(element) { requestAnimationFrame(() => element.classList.replace('opacity-0', 'opacity-100')); }

  updateHud() {
    this.els['l4-score-val'].textContent = ScoreManager.currentScore;
    this.els['l4-progress-val'].textContent = `${this.answers.length} / ${this.words.length}`;
  }

  updateTime() {
    if (!this.state.timerRunning) return;
    this.elapsed += 1;
    const minutes = String(Math.floor(this.elapsed / 60)).padStart(2, '0');
    const seconds = String(this.elapsed % 60).padStart(2, '0');
    this.els['l4-time-val'].textContent = `${minutes}:${seconds}`;
  }

  cleanup() {
    [this.els?.['l4-btn-help'], this.els?.['l4-btn-check'], this.els?.['l4-btn-exit']].forEach((element) => { if (element) element.onclick = null; });
    if (this.uiContainer) this.uiContainer.innerHTML = '';
    if (this.gameContainer) this.gameContainer.style.backgroundImage = 'none';
  }
}

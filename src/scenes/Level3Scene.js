import Phaser from 'phaser';
import SaveManager from '../managers/SaveManager.js';
import ScoreManager from '../managers/ScoreManager.js';
import { level3Data } from '../data/level3Data.js';
import level3Template from '../templates/Level3Overlay.html?raw';
import { createAksaraKeyboard } from '../ui/aksaraKeyboard.js';
import { addAudioToggle, confirmLeaveLevel, showFeedback, showHistoryPopup, showKeyboardTutorial } from '../ui/overlayKit.js';
import { isSameAksara } from '../utils/aksara.js';
import { sfxOpen, sfxWrite } from '../utils/sfx.js';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

const SENTENCES = level3Data.sentences;
const latinOf = (sentence) => `${sentence.chunks.map(([, latin]) => latin).join(' ')}.`;

/**
 * Level3Scene: "Nemokke Ukara".
 * Alur: sejarah candi → nemu gulungan kertas → perintah → 5 ukara siji-siji:
 *       klik tembung sing salah → tulis sing bener nganggo keyboard aksara (tutorial sepisan) → papan skor.
 */
export default class Level3Scene extends Phaser.Scene {
  constructor() {
    super('Level3Scene');
  }

  create() {
    fadeTransitionIn(this, 500);
    ScoreManager.resetLevelScore();
    this.state = { phase: 'history', index: 0, selected: null, busy: false, timerRunning: false, tutorialShown: false };
    this.answers = [];
    this.elapsed = 0;

    const save = SaveManager.load();
    save.lastActiveScene = 'Level3Scene';
    SaveManager.save(save);

    this.gameContainer = document.getElementById('wasis-aksara-game')?.parentElement;
    if (this.gameContainer) {
      this.gameContainer.style.backgroundImage = "linear-gradient(rgba(20,14,8,.45), rgba(20,14,8,.45)), url('/assets/images/Bg_CandiTikusNew.webp')";
      this.gameContainer.style.backgroundSize = 'cover';
      this.gameContainer.style.backgroundPosition = 'center';
    }

    this.uiContainer = document.getElementById('ui-overlay-container');
    if (this.uiContainer) this.uiContainer.innerHTML = level3Template;
    const ids = ['level3-overlay', 'l3-hud', 'l3-time-val', 'l3-progress-val', 'l3-score-val', 'l3-btn-exit', 'l3-scroll-stage', 'l3-rolled', 'l3-rolled-hint', 'l3-command', 'l3-command-paper', 'l3-command-title', 'l3-command-text', 'l3-btn-command-next', 'l3-puzzle', 'l3-step', 'l3-sentence', 'l3-latin', 'l3-prompt', 'l3-kb-panel', 'l3-selected-aksara', 'l3-selected-latin', 'l3-preview', 'l3-kb-mount', 'l3-btn-help', 'l3-btn-check'];
    this.els = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
    this.els['level3-overlay'].classList.remove('hidden');

    this.els['l3-command-title'].textContent = level3Data.command.title;
    this.els['l3-command-text'].textContent = level3Data.command.text;
    this.keyboard = createAksaraKeyboard({ onChange: (value) => this.onTyped(value) });
    this.els['l3-kb-mount'].appendChild(this.keyboard.element);
    this.bindEvents();
    this.updateHud();

    this.time.delayedCall(150, () => this.els['l3-hud'].classList.replace('opacity-0', 'opacity-100'));
    this.time.delayedCall(400, async () => {
      await showHistoryPopup(3);
      if (this.sys.isActive()) this.showRolledScroll();
    });
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.updateTime() });
    this.events.once('shutdown', () => this.cleanup());
  }

  bindEvents() {
    this.els['l3-rolled'].onclick = () => this.openScroll();
    this.els['l3-btn-command-next'].onclick = () => this.startPuzzle();
    this.els['l3-btn-help'].onclick = () => showKeyboardTutorial();
    this.els['l3-btn-check'].onclick = () => this.checkAnswer();
    this.els['l3-btn-exit'].onclick = () => this.leaveToMap();
    addAudioToggle(this.els['l3-btn-exit']);
    this.boundElements = Object.values(this.els);
  }

  // ─── 1–2. Gulungan kertas → perintah ────────────────────────────────────────

  showRolledScroll() {
    this.state.phase = 'scroll';
    this.fadeIn(this.els['l3-scroll-stage']);
  }

  openScroll() {
    if (this.state.phase !== 'scroll') return;
    this.state.phase = 'command';
    this.fadeOut(this.els['l3-scroll-stage'], true);
    sfxOpen();
    this.showModal(this.els['l3-command']);
    // Kertas "membentang" dari tinggi 0
    this.time.delayedCall(150, () => this.els['l3-command-paper'].classList.add('is-open'));
  }

  // ─── 3. Ukara siji-siji ─────────────────────────────────────────────────────

  startPuzzle() {
    if (this.state.phase !== 'command') return;
    this.state.phase = 'puzzle';
    this.state.timerRunning = true;
    this.hideModal(this.els['l3-command']);
    const puzzle = this.els['l3-puzzle'];
    puzzle.classList.replace('hidden', 'flex');
    this.fadeIn(puzzle);
    this.showSentence(0);
  }

  showSentence(index) {
    const sentence = SENTENCES[index];
    this.state.index = index;
    this.state.selected = null;
    this.state.busy = false;
    this.els['l3-step'].textContent = `Ukara ${index + 1} / ${SENTENCES.length}`;
    this.els['l3-latin'].textContent = latinOf(sentence);

    this.chunkEls = sentence.chunks.map(([aksara], chunkIndex) => {
      const chunk = document.createElement('span');
      chunk.className = 'l3-chunk';
      chunk.textContent = chunkIndex === sentence.wrongIndex ? sentence.wrong : aksara;
      chunk.onclick = () => this.selectChunk(chunkIndex);
      return chunk;
    });
    this.els['l3-sentence'].replaceChildren(...this.chunkEls, '꧉');

    this.els['l3-prompt'].classList.remove('invisible');
    this.closePanel();
    this.keyboard.clear();
    this.keyboard.setDisabled(false);
  }

  async selectChunk(chunkIndex) {
    if (this.state.phase !== 'puzzle' || this.state.busy) return;
    const sentence = SENTENCES[this.state.index];
    this.state.selected = chunkIndex;
    this.chunkEls.forEach((chunk, i) => chunk.classList.toggle('is-selected', i === chunkIndex));
    this.els['l3-selected-aksara'].textContent = this.chunkEls[chunkIndex].textContent;
    this.els['l3-selected-latin'].textContent = sentence.chunks[chunkIndex][1];
    this.keyboard.clear();
    sfxWrite();
    this.openPanel();

    // Tutorial keyboard muncul sekali saat keyboard pertama kali dibuka
    if (!this.state.tutorialShown) {
      this.state.tutorialShown = true;
      await showKeyboardTutorial();
    }
  }

  onTyped(value) {
    this.els['l3-preview'].textContent = value;
    this.updateCheckButton();
  }

  updateCheckButton() {
    this.els['l3-btn-check'].disabled = this.state.busy || this.state.selected === null || !this.keyboard.value;
  }

  async checkAnswer() {
    if (this.state.phase !== 'puzzle' || this.state.busy || this.state.selected === null || !this.keyboard.value) return;
    this.state.busy = true;
    this.keyboard.setDisabled(true);
    this.updateCheckButton();

    const sentence = SENTENCES[this.state.index];
    const [answer, answerLatin] = sentence.chunks[sentence.wrongIndex];
    const typed = this.keyboard.value;
    // Bener jika memilih tembung yang salah DAN menulis ulang dengan tepat (pada diabaikan)
    const correct = this.state.selected === sentence.wrongIndex && isSameAksara(typed, answer, { ignorePada: true });
    this.chunkEls[this.state.selected].classList.add(correct ? 'is-correct' : 'is-wrong');
    this.answers.push({
      question: `${latinOf(sentence)} (${answerLatin})`,
      playerAnswer: typed,
      correctAnswer: answer,
      correct,
      note: correct ? '' : sentence.reason
    });
    if (correct) ScoreManager.addBonus(level3Data.scoring.correct);
    this.updateHud();

    await showFeedback(correct);
    if (!this.sys.isActive()) return;
    if (this.state.index < SENTENCES.length - 1) this.showSentence(this.state.index + 1);
    else this.finishLevel();
  }

  openPanel() {
    const panel = this.els['l3-kb-panel'];
    this.els['l3-prompt'].classList.add('invisible');
    // Selalu buka: panel bisa sedang dalam animasi tutup dari ukara sebelumnya
    const wasClosed = panel.classList.contains('translate-y-full');
    panel.classList.remove('hidden');
    requestAnimationFrame(() => panel.classList.remove('translate-y-full'));
    if (wasClosed) sfxOpen();
  }

  closePanel() {
    const panel = this.els['l3-kb-panel'];
    panel.classList.add('translate-y-full');
    this.time.delayedCall(500, () => {
      if (this.state.selected === null) panel.classList.add('hidden');
    });
  }

  finishLevel() {
    this.state.phase = 'finished';
    this.state.timerRunning = false;
    this.closePanel();
    const correctCount = this.answers.filter((answer) => answer.correct).length;
    const score = ScoreManager.currentScore;
    const stars = ScoreManager.starsFromCorrect(correctCount, SENTENCES.length);
    this.time.delayedCall(500, () => {
      this.els['level3-overlay'].style.opacity = '0';
      fadeTransitionOut(this, 500, () => this.scene.start('ResultScene', { level: 3, score, stars, answers: this.answers }));
    });
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
    this.els['l3-score-val'].textContent = ScoreManager.currentScore;
    this.els['l3-progress-val'].textContent = `${this.answers.length} / ${SENTENCES.length}`;
  }

  updateTime() {
    if (!this.state.timerRunning) return;
    this.elapsed += 1;
    const minutes = String(Math.floor(this.elapsed / 60)).padStart(2, '0');
    const seconds = String(this.elapsed % 60).padStart(2, '0');
    this.els['l3-time-val'].textContent = `${minutes}:${seconds}`;
  }

  cleanup() {
    this.boundElements?.forEach((element) => { if (element) element.onclick = null; });
    if (this.uiContainer) this.uiContainer.innerHTML = '';
    if (this.gameContainer) this.gameContainer.style.backgroundImage = 'none';
  }
}

import Phaser from 'phaser';
import SaveManager from '../managers/SaveManager.js';
import ScoreManager from '../managers/ScoreManager.js';
import HintManager from '../managers/HintManager.js';
import { level1Data } from '../data/level1Data.js';
import level1Template from '../templates/Level1Overlay.html?raw';
import { addAudioToggle, confirmLeaveLevel, showFeedback, showHistoryPopup } from '../ui/overlayKit.js';
import { sfxError, sfxOpen, sfxReward, sfxWrite } from '../utils/sfx.js';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

const WORDS = level1Data.words;
const MOSS_COLORS = ['#2f4a1f', '#3b5a28', '#4f7a35', '#5f8f3f', '#26401a', '#6d9a45'];

/**
 * Level1Scene: "Misteri Cathetan Patirtan".
 * Alur: sejarah candi → dialog permukaan → nyilem ke dhasar blumbang → usap lumut ing watu
 *       → nulis 5 tembung ing papan tulis (sepisan kirim, umpan balik saben tembung) → papan skor.
 */
export default class Level1Scene extends Phaser.Scene {
  constructor() {
    super('Level1Scene');
  }

  create() {
    fadeTransitionIn(this, 500);
    ScoreManager.resetLevelScore();
    HintManager.resetCooldown();
    this.state = { phase: 'history', step: 0, wordIndex: 0, busy: false, hintUsed: false, timerRunning: false };
    this.answers = [];
    this.elapsed = 0;
    this.hintInterval = null;
    this.typewriterInterval = null;

    const save = SaveManager.load();
    save.lastActiveScene = 'Level1Scene';
    SaveManager.save(save);

    this.gameContainer = document.getElementById('wasis-aksara-game')?.parentElement;
    if (this.gameContainer) {
      this.gameContainer.style.backgroundImage = "url('/assets/images/Bg_CandiTikusNew.webp')";
      this.gameContainer.style.backgroundSize = 'cover';
      this.gameContainer.style.backgroundPosition = 'center';
    }

    this.uiContainer = document.getElementById('ui-overlay-container');
    if (this.uiContainer) this.uiContainer.innerHTML = level1Template;
    this.$ = (id) => document.getElementById(id);
    this.cacheElements();
    this.els['level1-overlay']?.classList.remove('hidden');
    this.setupWritingCanvas();
    this.setupMoss();
    this.buildStone();
    this.buildUnderwaterDecor();
    this.buildWordChips();
    this.bindEvents();
    this.updateHud();

    this.time.delayedCall(150, () => this.els['l1-hud']?.classList.replace('opacity-0', 'opacity-100'));
    this.time.delayedCall(400, async () => {
      await showHistoryPopup(1);
      if (this.sys.isActive()) this.showNarrative(0);
    });
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.updateTime() });
    this.events.once('shutdown', () => this.cleanup());
  }

  cacheElements() {
    const ids = ['level1-overlay', 'l1-hud', 'l1-time-val', 'l1-score-val', 'l1-progress-val', 'l1-btn-exit', 'l1-underwater', 'l1-weeds', 'l1-bubbles', 'l1-stone-wrap', 'l1-stone-title', 'l1-stone-instruction', 'l1-stone-words', 'l1-moss', 'l1-moss-hint', 'l1-moss-progress', 'l1-start-wrap', 'l1-btn-start-board', 'l1-dialog', 'l1-dialog-text', 'l1-dialog-next', 'l1-dialog-next-label', 'l1-board', 'l1-board-title', 'l1-board-step', 'l1-target-card', 'l1-target-label', 'l1-target-latin', 'l1-wordchips', 'l1-board-msg-box', 'l1-board-msg', 'l1-canvas-wrap', 'l1-writing-canvas', 'l1-canvas-placeholder', 'l1-btn-pen', 'l1-btn-eraser', 'l1-btn-clear', 'l1-btn-hint', 'l1-hint-label', 'l1-btn-materi-board', 'l1-btn-submit', 'l1-hint-preview', 'l1-hint-preview-text', 'l1-materi-modal', 'l1-btn-close-materi', 'l1-btn-close-materi-bottom', 'l1-tab-legena', 'l1-tab-sandhangan', 'l1-panel-legena', 'l1-panel-sandhangan'];
    this.els = Object.fromEntries(ids.map((id) => [id, this.$(id)]));
  }

  bindEvents() {
    this.els['l1-dialog-next'].onclick = () => this.nextNarrative();
    this.els['l1-btn-start-board'].onclick = () => this.startBoard();
    this.els['l1-btn-pen'].onclick = () => this.setDrawingTool('pen');
    this.els['l1-btn-eraser'].onclick = () => this.setDrawingTool('eraser');
    this.els['l1-btn-clear'].onclick = () => this.clearCanvas();
    this.els['l1-btn-submit'].onclick = () => this.submitAnswer();
    this.els['l1-btn-hint'].onclick = () => this.useHint();
    this.els['l1-btn-materi-board'].onclick = () => this.showModal(this.els['l1-materi-modal']);
    this.els['l1-btn-close-materi'].onclick = () => this.hideModal(this.els['l1-materi-modal']);
    this.els['l1-btn-close-materi-bottom'].onclick = () => this.hideModal(this.els['l1-materi-modal']);
    this.els['l1-tab-legena'].onclick = () => this.switchMateriTab('legena');
    this.els['l1-tab-sandhangan'].onclick = () => this.switchMateriTab('sandhangan');
    this.els['l1-btn-exit'].onclick = () => this.leaveToMap();
    addAudioToggle(this.els['l1-btn-exit']);
    this.boundElements = Object.values(this.els).filter(Boolean);
  }

  // ─── 1. Dialog ing permukaan blumbang ───────────────────────────────────────

  showNarrative(step) {
    this.state.step = step;
    this.state.phase = 'narrative';
    const dialog = this.els['l1-dialog'];
    dialog.classList.remove('hidden');
    dialog.classList.add('flex');
    this.els['l1-dialog-next-label'].textContent = step === level1Data.narrative.length - 1 ? 'NYILEM' : 'LANJUT';
    this.typeText(level1Data.narrative[step]);
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
    if (this.state.phase !== 'narrative') return;
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
    this.dive();
  }

  // ─── 2. Nyilem: ganti tampilan dadi dhasar blumbang ─────────────────────────

  dive() {
    this.state.phase = 'dive';
    this.fadeOut(this.els['l1-dialog'], true);
    sfxOpen();
    const underwater = this.els['l1-underwater'];
    underwater.classList.remove('hidden');
    this.fadeIn(underwater);
    this.time.delayedCall(1000, () => {
      // Sisi layar di luar rasio 16:9 ikut bernuansa air
      if (this.gameContainer) this.gameContainer.style.backgroundImage = 'linear-gradient(180deg, #1d5f68 0%, #0b3238 100%)';
      this.state.phase = 'moss';
      this.els['l1-moss-hint'].classList.replace('opacity-0', 'opacity-100');
    });
  }

  buildUnderwaterDecor() {
    // Gelembung naik dengan ukuran, posisi, dan kecepatan acak
    for (let i = 0; i < 18; i += 1) {
      const bubble = document.createElement('span');
      const size = Phaser.Math.Between(6, 18);
      bubble.className = 'l1-bubble';
      Object.assign(bubble.style, {
        left: `${Phaser.Math.Between(2, 98)}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${Phaser.Math.Between(7, 15)}s`,
        animationDelay: `-${Phaser.Math.Between(0, 15)}s`
      });
      bubble.style.setProperty('--drift', `${Phaser.Math.Between(-40, 40)}px`);
      this.els['l1-bubbles'].appendChild(bubble);
    }
    // Ganggang yang bergoyang di dasar kolam
    const weeds = [8, 15, 22, 74, 81, 88, 94].map((left) => {
      const height = Phaser.Math.Between(90, 170);
      const delay = Phaser.Math.FloatBetween(0, 3).toFixed(2);
      const bend = Phaser.Math.Between(-18, 18);
      return `<svg class="l1-weed absolute bottom-0" style="left:${left}%;animation-delay:-${delay}s" width="40" height="${height}" viewBox="0 0 40 ${height}">
        <path d="M20 ${height} Q${20 + bend} ${height * 0.5} 20 0" stroke="#2f5a2c" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/>
        <path d="M14 ${height} Q${8 - bend} ${height * 0.6} 10 ${height * 0.25}" stroke="#3f7038" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
      </svg>`;
    });
    this.els['l1-weeds'].innerHTML = weeds.join('');
  }

  // ─── 3. Usap lumut ing watu kanggo maca cathetan ────────────────────────────

  buildStone() {
    this.els['l1-stone-title'].textContent = level1Data.stone.title;
    this.els['l1-stone-instruction'].textContent = level1Data.stone.instruction;
    WORDS.forEach((word) => {
      const item = document.createElement('span');
      item.className = 'l1-stone-text font-marcellus text-[18px] font-bold';
      item.textContent = word.latin;
      this.els['l1-stone-words'].appendChild(item);
    });
  }

  setupMoss() {
    const canvas = this.els['l1-moss'];
    const context = canvas.getContext('2d', { willReadFrequently: true });
    this.moss = { canvas, context, scrubbing: false, last: null, moves: 0 };

    // Lapisan lumut prosedural: dasar hijau + gumpalan + bintik halus
    context.fillStyle = '#3b5a28';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 700; i += 1) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = 6 + Math.random() * 24;
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, MOSS_COLORS[i % MOSS_COLORS.length]);
      gradient.addColorStop(1, 'rgba(59,90,40,0)');
      context.globalAlpha = 0.45 + Math.random() * 0.45;
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    for (let i = 0; i < 2600; i += 1) {
      context.globalAlpha = 0.5;
      context.fillStyle = Math.random() > 0.5 ? '#86b85a' : '#1d3313';
      context.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 1.5);
    }
    context.globalAlpha = 1;

    const scrub = (event) => {
      if (!this.moss.scrubbing || this.state.phase !== 'moss') return;
      const rect = canvas.getBoundingClientRect();
      const point = { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
      context.globalCompositeOperation = 'destination-out';
      context.lineCap = 'round';
      context.lineWidth = 58;
      context.beginPath();
      context.moveTo((this.moss.last || point).x, (this.moss.last || point).y);
      context.lineTo(point.x, point.y);
      context.stroke();
      this.moss.last = point;
      this.moss.moves += 1;
      if (this.moss.moves % 8 === 0) {
        sfxWrite();
        this.updateMossProgress();
      }
    };
    canvas.addEventListener('pointerdown', (event) => {
      if (this.state.phase !== 'moss') return;
      this.moss.scrubbing = true;
      this.moss.last = null;
      canvas.setPointerCapture(event.pointerId);
      scrub(event);
    });
    canvas.addEventListener('pointermove', scrub);
    const stop = () => {
      if (!this.moss.scrubbing) return;
      this.moss.scrubbing = false;
      this.updateMossProgress();
    };
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
  }

  /** Persentase lumut yang sudah bersih, dihitung hanya di dalam bentuk elips watu. */
  measureMossCleared() {
    const { canvas, context } = this.moss;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let total = 0;
    let cleared = 0;
    for (let y = 0; y < canvas.height; y += 6) {
      for (let x = 0; x < canvas.width; x += 6) {
        if (((x - cx) / cx) ** 2 + ((y - cy) / cy) ** 2 > 0.9) continue;
        total += 1;
        if (pixels[(y * canvas.width + x) * 4 + 3] < 40) cleared += 1;
      }
    }
    return total ? cleared / total : 0;
  }

  updateMossProgress() {
    if (this.state.phase !== 'moss') return;
    const cleared = this.measureMossCleared();
    const target = level1Data.mossClearTarget;
    this.els['l1-moss-progress'].textContent = `${Math.min(100, Math.round((cleared / target) * 100))}%`;
    if (cleared >= target) this.revealStone();
  }

  revealStone() {
    this.state.phase = 'revealed';
    this.moss.scrubbing = false;
    this.els['l1-moss'].style.opacity = '0';
    this.els['l1-moss'].classList.remove('pointer-events-auto');
    this.els['l1-moss-hint'].classList.replace('opacity-100', 'opacity-0');
    sfxReward();
    this.time.delayedCall(900, () => {
      this.els['l1-moss'].classList.add('hidden');
      this.els['l1-start-wrap'].classList.remove('hidden');
    });
  }

  // ─── 4. Papan tulis: 5 tembung, sepisan kirim saben tembung ─────────────────

  buildWordChips() {
    WORDS.forEach((word, index) => {
      const chip = document.createElement('span');
      chip.id = `l1-chip-${index}`;
      chip.className = 'wa-chip';
      chip.textContent = word.latin;
      this.els['l1-wordchips'].appendChild(chip);
    });
  }

  startBoard() {
    if (this.state.phase !== 'revealed') return;
    this.state.phase = 'board';
    this.state.timerRunning = true;
    this.els['l1-start-wrap'].classList.add('hidden');
    // Watu mengecil ke atas supaya cathetan tetap terbaca selama menulis
    // (properti `scale` terpisah, karena kelas translate Tailwind v4 memakai properti `translate`)
    Object.assign(this.els['l1-stone-wrap'].style, { top: '178px', scale: '0.52' });
    this.els['l1-board-title'].textContent = 'Misteri Cathetan Patirtan';
    this.els['l1-target-label'].textContent = 'Tulisen ing Aksara Jawa:';
    this.showWord(0);
    const board = this.els['l1-board'];
    board.classList.remove('hidden');
    requestAnimationFrame(() => board.classList.remove('translate-y-full'));
    sfxOpen();
  }

  showWord(index) {
    this.state.wordIndex = index;
    this.state.hintUsed = false;
    this.state.busy = false;
    this.els['l1-target-latin'].textContent = WORDS[index].latin;
    this.els['l1-board-step'].textContent = `Tembung ${index + 1} / ${WORDS.length}`;
    this.setBoardMessage('');
    this.els['l1-hint-preview'].classList.add('hidden');
    WORDS.forEach((_, chipIndex) => this.$(`l1-chip-${chipIndex}`).classList.toggle('wa-chip-active', chipIndex === index));
    this.clearCanvas();
  }

  async submitAnswer() {
    if (this.state.phase !== 'board' || this.state.busy) return;
    if (!this.canvasState.hasInk) {
      sfxError();
      this.setBoardMessage('Tulisen dhisik ing papan.', 'text-state-error');
      this.shake(this.els['l1-target-card']);
      return;
    }

    this.state.busy = true;
    const index = this.state.wordIndex;
    const word = WORDS[index];
    const correct = this.measureWritingSimilarity().valid;
    this.answers.push({
      question: word.latin,
      playerAnswer: '',
      playerImage: this.inkSnapshot(),
      correctAnswer: word.aksara,
      correct
    });

    if (correct) {
      const { correct: full, correctWithHint } = level1Data.scoring;
      ScoreManager.addBonus(this.state.hintUsed ? correctWithHint : full);
    }
    const chip = this.$(`l1-chip-${index}`);
    chip.classList.remove('wa-chip-active');
    chip.classList.add(correct ? 'wa-chip-done' : 'wa-chip-wrong');
    this.updateHud();

    await showFeedback(correct);
    if (!this.sys.isActive()) return;
    if (index < WORDS.length - 1) this.showWord(index + 1);
    else this.finishLevel();
  }

  useHint() {
    if (this.state.phase !== 'board' || this.state.busy || !HintManager.triggerHint()) return;
    this.state.hintUsed = true;
    this.els['l1-hint-preview-text'].textContent = WORDS[this.state.wordIndex].aksara;
    this.els['l1-hint-preview'].classList.remove('hidden');
    this.setBoardMessage(`Hint dipakai: biji tembung iki dadi ${level1Data.scoring.correctWithHint}.`, 'text-state-warning');
    this.time.delayedCall(4000, () => this.els['l1-hint-preview']?.classList.add('hidden'));
    clearInterval(this.hintInterval);
    this.hintInterval = setInterval(() => {
      const remaining = HintManager.getRemainingCooldown();
      this.els['l1-hint-label'].textContent = remaining ? `${remaining}s` : '';
      if (!remaining) clearInterval(this.hintInterval);
    }, 500);
  }

  finishLevel() {
    this.state.phase = 'finished';
    this.state.timerRunning = false;
    this.closeBoard();
    const correctCount = this.answers.filter((answer) => answer.correct).length;
    const score = ScoreManager.currentScore;
    const stars = ScoreManager.starsFromCorrect(correctCount, WORDS.length);
    this.time.delayedCall(600, () => {
      this.els['level1-overlay'].style.opacity = '0';
      fadeTransitionOut(this, 500, () => this.scene.start('ResultScene', { level: 1, score, stars, answers: this.answers }));
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

  // ─── Papan tulis: kanvas, alat, lan pangecekan goresan ──────────────────────

  setupWritingCanvas() {
    const canvas = this.els['l1-writing-canvas'];
    this.canvasContext = canvas.getContext('2d', { willReadFrequently: true });
    this.referenceCanvas = document.createElement('canvas');
    this.referenceCanvas.width = canvas.width;
    this.referenceCanvas.height = canvas.height;
    this.referenceContext = this.referenceCanvas.getContext('2d', { willReadFrequently: true });
    this.canvasState = { drawing: false, hasInk: false, tool: 'pen' };
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', (event) => {
      if (this.state.phase !== 'board' || this.state.busy) return;
      this.canvasState.drawing = true;
      if (this.canvasState.tool === 'pen') this.canvasState.hasInk = true;
      canvas.setPointerCapture(event.pointerId);
      const point = this.canvasPoint(event);
      this.canvasContext.globalCompositeOperation = this.canvasState.tool === 'eraser' ? 'destination-out' : 'source-over';
      this.canvasContext.lineWidth = this.canvasState.tool === 'eraser' ? 28 : 5;
      this.canvasContext.beginPath();
      this.canvasContext.moveTo(point.x, point.y);
      this.els['l1-canvas-placeholder'].classList.add('hidden');
      sfxWrite();
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!this.canvasState.drawing) return;
      const point = this.canvasPoint(event);
      this.canvasContext.lineTo(point.x, point.y);
      this.canvasContext.stroke();
    });
    const finishStroke = () => {
      this.canvasState.drawing = false;
      this.canvasContext.closePath();
      if (this.canvasState.tool === 'eraser') this.refreshInkState();
    };
    canvas.addEventListener('pointerup', finishStroke);
    canvas.addEventListener('pointercancel', finishStroke);
    canvas.addEventListener('pointerleave', () => {
      if (this.canvasState.drawing) finishStroke();
    });
    this.canvasContext.lineWidth = 5;
    this.canvasContext.lineCap = 'round';
    this.canvasContext.lineJoin = 'round';
    this.canvasContext.strokeStyle = '#fff2cc';
  }

  canvasPoint(event) {
    const canvas = this.els['l1-writing-canvas'];
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
  }

  setDrawingTool(tool) {
    this.canvasState.tool = tool;
    this.els['l1-btn-pen'].classList.toggle('wa-tool-active', tool === 'pen');
    this.els['l1-btn-eraser'].classList.toggle('wa-tool-active', tool === 'eraser');
    this.els['l1-writing-canvas'].classList.toggle('is-erasing', tool === 'eraser');
    this.canvasContext.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    this.canvasContext.lineWidth = tool === 'eraser' ? 28 : 5;
  }

  refreshInkState() {
    const canvas = this.els['l1-writing-canvas'];
    const pixels = this.canvasContext.getImageData(0, 0, canvas.width, canvas.height).data;
    this.canvasState.hasInk = false;
    for (let index = 3; index < pixels.length; index += 16) {
      if (pixels[index] > 24) {
        this.canvasState.hasInk = true;
        break;
      }
    }
    this.els['l1-canvas-placeholder'].classList.toggle('hidden', this.canvasState.hasInk);
  }

  clearCanvas() {
    const canvas = this.els['l1-writing-canvas'];
    this.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    this.canvasState.hasInk = false;
    this.canvasState.drawing = false;
    this.canvasContext.globalCompositeOperation = 'source-over';
    this.setDrawingTool('pen');
    this.els['l1-canvas-placeholder'].classList.remove('hidden');
    this.drawGuide(WORDS[this.state.wordIndex].aksara);
  }

  /** Potongan goresan pemain (dipangkas ke area tinta) untuk ditampilkan di papan skor. */
  inkSnapshot() {
    const canvas = this.els['l1-writing-canvas'];
    const pixels = this.canvasContext.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        if (pixels[(y * canvas.width + x) * 4 + 3] > 24) {
          minX = Math.min(minX, x); minY = Math.min(minY, y);
          maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
        }
      }
    }
    if (maxX < 0) return canvas.toDataURL('image/png');
    const pad = 12;
    const x = Math.max(0, minX - pad);
    const y = Math.max(0, minY - pad);
    const width = Math.min(canvas.width, maxX + pad) - x;
    const height = Math.min(canvas.height, maxY + pad) - y;
    const crop = document.createElement('canvas');
    crop.width = width;
    crop.height = height;
    crop.getContext('2d').drawImage(canvas, x, y, width, height, 0, 0, width, height);
    return crop.toDataURL('image/png');
  }

  /** Aksara kunci digambar ke kanvas tersembunyi sebagai pembanding goresan. */
  drawGuide(text) {
    const canvas = this.els['l1-writing-canvas'];
    this.referenceContext.clearRect(0, 0, canvas.width, canvas.height);
    this.referenceContext.save();
    this.referenceContext.font = '58px javanese';
    this.referenceContext.textAlign = 'center';
    this.referenceContext.textBaseline = 'middle';
    this.referenceContext.fillStyle = '#ffffff';
    this.referenceContext.fillText(text, canvas.width / 2, canvas.height / 2);
    this.referenceContext.restore();
  }

  measureWritingSimilarity() {
    const width = this.els['l1-writing-canvas'].width;
    const height = this.els['l1-writing-canvas'].height;
    const ink = this.canvasContext.getImageData(0, 0, width, height).data;
    const reference = this.referenceContext.getImageData(0, 0, width, height).data;
    const columns = 64;
    const rows = 20;
    const makeMask = (pixels) => {
      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          if (pixels[(y * width + x) * 4 + 3] > 24) {
            minX = Math.min(minX, x); minY = Math.min(minY, y);
            maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
          }
        }
      }
      if (maxX < 0) return null;
      const mask = Array.from({ length: rows }, () => Array(columns).fill(false));
      const sourceWidth = Math.max(1, maxX - minX + 1);
      const sourceHeight = Math.max(1, maxY - minY + 1);
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const startX = Math.floor(minX + column * sourceWidth / columns);
          const endX = Math.ceil(minX + (column + 1) * sourceWidth / columns);
          const startY = Math.floor(minY + row * sourceHeight / rows);
          const endY = Math.ceil(minY + (row + 1) * sourceHeight / rows);
          for (let y = startY; y < endY; y += 2) {
            for (let x = startX; x < endX; x += 2) {
              if (pixels[(y * width + x) * 4 + 3] > 24) mask[row][column] = true;
            }
          }
        }
      }
      const active = mask.flat().filter(Boolean).length;
      return { mask, active, aspect: sourceWidth / sourceHeight, density: active / (columns * rows) };
    };
    const inkShape = makeMask(ink);
    const guideShape = makeMask(reference);
    if (!inkShape || !guideShape) return { score: 0, valid: false };
    const inkMask = inkShape.mask;
    const guideMask = guideShape.mask;

    const around = (mask, row, column) => {
      for (let y = Math.max(0, row - 1); y <= Math.min(rows - 1, row + 1); y += 1) {
        for (let x = Math.max(0, column - 1); x <= Math.min(columns - 1, column + 1); x += 1) {
          if (mask[y][x]) return true;
        }
      }
      return false;
    };

    let inkCount = 0;
    let guideCount = 0;
    let alignedInk = 0;
    let coveredGuide = 0;
    let intersection = 0;
    let union = 0;
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        if (inkMask[row][column]) {
          inkCount += 1;
          if (around(guideMask, row, column)) alignedInk += 1;
        }
        if (guideMask[row][column]) {
          guideCount += 1;
          if (around(inkMask, row, column)) coveredGuide += 1;
        }
        if (inkMask[row][column] && guideMask[row][column]) intersection += 1;
        if (inkMask[row][column] || guideMask[row][column]) union += 1;
      }
    }
    if (!inkCount || !guideCount) return { score: 0, valid: false };
    const precision = alignedInk / inkCount;
    const recall = coveredGuide / guideCount;
    const relaxedF1 = 2 * precision * recall / Math.max(0.001, precision + recall);
    const iou = intersection / Math.max(1, union);
    const aspectSimilarity = Math.min(inkShape.aspect, guideShape.aspect) / Math.max(inkShape.aspect, guideShape.aspect);
    const densitySimilarity = Math.min(inkShape.density, guideShape.density) / Math.max(inkShape.density, guideShape.density);

    const profileSimilarity = (axis) => {
      const length = axis === 'row' ? rows : columns;
      const breadth = axis === 'row' ? columns : rows;
      let difference = 0;
      for (let index = 0; index < length; index += 1) {
        let inkTotal = 0;
        let guideTotal = 0;
        for (let offset = 0; offset < breadth; offset += 1) {
          const row = axis === 'row' ? index : offset;
          const column = axis === 'row' ? offset : index;
          if (inkMask[row][column]) inkTotal += 1;
          if (guideMask[row][column]) guideTotal += 1;
        }
        difference += Math.abs(inkTotal - guideTotal) / breadth;
      }
      return Math.max(0, 1 - difference / length);
    };
    const rowProfile = profileSimilarity('row');
    const columnProfile = profileSimilarity('column');
    const profile = (rowProfile + columnProfile) / 2;
    const score = iou * 0.35 + relaxedF1 * 0.3 + profile * 0.2 + aspectSimilarity * 0.08 + densitySimilarity * 0.07;
    const valid = score >= 0.64
      && iou >= 0.25
      && precision >= 0.56
      && recall >= 0.52
      && profile >= 0.82
      && aspectSimilarity >= 0.68
      && densitySimilarity >= 0.6;
    return { score, valid };
  }

  // ─── Utilitas UI ────────────────────────────────────────────────────────────

  setBoardMessage(text, colorClass = 'text-stone-soft/80') {
    this.els['l1-board-msg'].textContent = text;
    this.els['l1-board-msg'].className = `font-poppins text-[11px] font-semibold ${colorClass}`;
  }

  shake(element) {
    if (!element) return;
    element.classList.remove('animate-wa-shake');
    void element.offsetWidth;
    element.classList.add('animate-wa-shake');
  }

  showModal(element) {
    if (!element) return;
    element.classList.remove('hidden');
    element.classList.add('flex');
    requestAnimationFrame(() => element.classList.replace('opacity-0', 'opacity-100'));
  }

  hideModal(element) {
    if (!element) return;
    element.classList.replace('opacity-100', 'opacity-0');
    this.time.delayedCall(300, () => { element.classList.add('hidden'); element.classList.remove('flex'); });
  }

  switchMateriTab(tab) {
    const isLegena = tab === 'legena';
    
    // Tab Button 1: Legena
    if (this.els['l1-tab-legena']) {
      this.els['l1-tab-legena'].classList.toggle('bg-majapahit-gold', isLegena);
      this.els['l1-tab-legena'].classList.toggle('text-stone-dark', isLegena);
      this.els['l1-tab-legena'].classList.toggle('text-stone-soft/80', !isLegena);
    }

    // Tab Button 2: Sandhangan
    if (this.els['l1-tab-sandhangan']) {
      this.els['l1-tab-sandhangan'].classList.toggle('bg-majapahit-gold', !isLegena);
      this.els['l1-tab-sandhangan'].classList.toggle('text-stone-dark', !isLegena);
      this.els['l1-tab-sandhangan'].classList.toggle('text-stone-soft/80', isLegena);
    }

    // Panels toggle
    if (this.els['l1-panel-legena']) {
      this.els['l1-panel-legena'].classList.toggle('hidden', !isLegena);
      this.els['l1-panel-legena'].classList.toggle('grid', isLegena);
    }
    if (this.els['l1-panel-sandhangan']) {
      this.els['l1-panel-sandhangan'].classList.toggle('hidden', isLegena);
      this.els['l1-panel-sandhangan'].classList.toggle('grid', !isLegena);
    }
  }

  closeBoard() {
    this.els['l1-board'].classList.add('translate-y-full');
    this.time.delayedCall(500, () => this.els['l1-board']?.classList.add('hidden'));
  }

  fadeIn(element) { requestAnimationFrame(() => element.classList.replace('opacity-0', 'opacity-100')); }
  fadeOut(element, hide = false) {
    element.classList.replace('opacity-100', 'opacity-0');
    if (hide) this.time.delayedCall(500, () => { element.classList.add('hidden'); element.classList.remove('flex'); });
  }

  updateHud() {
    this.els['l1-score-val'].textContent = ScoreManager.currentScore;
    this.els['l1-progress-val'].textContent = `${this.answers.length} / ${WORDS.length}`;
  }

  updateTime() {
    if (!this.state.timerRunning) return;
    this.elapsed += 1;
    const minutes = String(Math.floor(this.elapsed / 60)).padStart(2, '0');
    const seconds = String(this.elapsed % 60).padStart(2, '0');
    this.els['l1-time-val'].textContent = `${minutes}:${seconds}`;
  }

  cleanup() {
    clearInterval(this.typewriterInterval);
    clearInterval(this.hintInterval);
    this.boundElements?.forEach((element) => { element.onclick = null; });
    if (this.uiContainer) this.uiContainer.innerHTML = '';
    if (this.gameContainer) this.gameContainer.style.backgroundImage = 'none';
  }
}

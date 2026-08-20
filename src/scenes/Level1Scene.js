import Phaser from 'phaser';
import SaveManager from '../managers/SaveManager.js';
import ScoreManager from '../managers/ScoreManager.js';
import HintManager from '../managers/HintManager.js';
import { level1Data } from '../data/level1Data.js';
import { levelData } from '../data/levelData.js';
import level1Template from '../templates/Level1Overlay.html?raw';
import { sfxError, sfxOpen, sfxReward, sfxSuccess, sfxWrite } from '../utils/sfx.js';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

const normalize = (value) => value.replace(/\s+/g, '');

export default class Level1Scene extends Phaser.Scene {
  constructor() {
    super('Level1Scene');
  }

  create() {
    fadeTransitionIn(this, 500);
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
    this.setupWritingCanvas();
    this.buildWordChips();
    this.bindEvents();
    this.updateHud();

    this.time.delayedCall(150, () => this.els['l1-hud']?.classList.replace('opacity-0', 'opacity-100'));
    this.time.delayedCall(400, () => this.showNarrative(0));
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.updateTime() });
    this.events.once('shutdown', () => this.cleanup());
  }

  cacheElements() {
    const ids = ['level1-overlay', 'l1-hud', 'l1-time-val', 'l1-score-val', 'l1-progress-val', 'l1-btn-exit', 'l1-btn-materi', 'l1-dialog', 'l1-dialog-text', 'l1-dialog-next', 'l1-dialog-next-label', 'l1-ornament', 'l1-gate-glow', 'l1-board', 'l1-board-title', 'l1-board-step', 'l1-target-card', 'l1-target-label', 'l1-target-latin', 'l1-wordchips', 'l1-board-msg-box', 'l1-board-msg', 'l1-canvas-wrap', 'l1-writing-canvas', 'l1-canvas-placeholder', 'l1-btn-pen', 'l1-btn-eraser', 'l1-btn-clear', 'l1-btn-hint', 'l1-hint-label', 'l1-btn-materi-board', 'l1-btn-submit', 'l1-hint-preview', 'l1-hint-preview-text', 'l1-sentence-intro', 'l1-btn-open-sentence', 'l1-reward', 'l1-btn-claim', 'l1-materi-modal', 'l1-btn-close-materi', 'l1-btn-close-materi-bottom', 'l1-tab-legena', 'l1-tab-sandhangan', 'l1-panel-legena', 'l1-panel-sandhangan'];
    this.els = Object.fromEntries(ids.map((id) => [id, this.$(id)]));
  }

  setupWritingCanvas() {
    const canvas = this.els['l1-writing-canvas'];
    this.canvasContext = canvas.getContext('2d');
    this.referenceCanvas = document.createElement('canvas');
    this.referenceCanvas.width = canvas.width;
    this.referenceCanvas.height = canvas.height;
    this.referenceContext = this.referenceCanvas.getContext('2d');
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
    this.els['l1-btn-pen'].onclick = () => this.setDrawingTool('pen');
    this.els['l1-btn-eraser'].onclick = () => this.setDrawingTool('eraser');
    this.els['l1-btn-clear'].onclick = () => this.clearCanvas();
    this.els['l1-btn-submit'].onclick = () => this.submitAnswer();
    this.els['l1-btn-hint'].onclick = () => this.useHint();
    if (this.els['l1-btn-materi']) this.els['l1-btn-materi'].onclick = () => this.openMateriModal();
    if (this.els['l1-btn-materi-board']) this.els['l1-btn-materi-board'].onclick = () => this.openMateriModal();
    if (this.els['l1-btn-close-materi']) this.els['l1-btn-close-materi'].onclick = () => this.closeMateriModal();
    if (this.els['l1-btn-close-materi-bottom']) this.els['l1-btn-close-materi-bottom'].onclick = () => this.closeMateriModal();
    if (this.els['l1-tab-legena']) this.els['l1-tab-legena'].onclick = () => this.switchMateriTab('legena');
    if (this.els['l1-tab-sandhangan']) this.els['l1-tab-sandhangan'].onclick = () => this.switchMateriTab('sandhangan');
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
    this.fadeIn(dialog);
    if (this.els['l1-ornament']) {
      this.els['l1-ornament'].classList.add('hidden');
      this.els['l1-ornament'].classList.remove('flex');
    }
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
    this.state.phase = 'transition';
    this.fadeOut(this.els['l1-dialog'], true);
    sfxOpen();
    this.time.delayedCall(500, () => {
      this.state.phase = 'explore';
      if (this.els['l1-ornament']) {
        this.els['l1-ornament'].classList.remove('hidden');
        this.els['l1-ornament'].classList.add('flex');
      }
    });
  }

  openWordsBoard() {
    if (this.state.phase !== 'explore') return;
    if (this.els['l1-ornament']) {
      this.els['l1-ornament'].classList.add('hidden');
      this.els['l1-ornament'].classList.remove('flex');
    }
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
    if (this.els['l1-board-msg']) this.els['l1-board-msg'].textContent = '';
    this.updateChipStates();
    this.clearCanvas();
    this.drawGuide(sentence ? level1Data.sentence.aksara : level1Data.words[this.state.wordIndex].aksara);
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
    this.drawGuide(this.state.mode === 'sentence' ? level1Data.sentence.aksara : level1Data.words[this.state.wordIndex].aksara);
  }

  drawGuide(text) {
    const canvas = this.els['l1-writing-canvas'];
    this.referenceContext.clearRect(0, 0, canvas.width, canvas.height);
    this.referenceContext.save();
    this.referenceContext.font = this.state.mode === 'sentence' ? '28px javanese' : '58px javanese';
    this.referenceContext.textAlign = 'center';
    this.referenceContext.textBaseline = 'middle';
    this.referenceContext.fillStyle = '#ffffff';
    this.referenceContext.fillText(text, canvas.width / 2, canvas.height / 2);
    this.referenceContext.restore();
  }

  submitAnswer() {
    if (this.state.phase !== 'board' || this.state.busy) return;
    if (!this.canvasState.hasInk) return this.wrongAnswer('Tulisen dhisik ing papan.');
    const similarity = this.measureWritingSimilarity();
    if (!similarity.valid) return this.wrongAnswer(`Tulisanmu durung cedhak karo conto (${Math.round(similarity.score * 100)}%). Coba tiru maneh.`);
    this.correctAnswer();
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

  wrongAnswer(message) {
    ScoreManager.addWrongAnswer();
    sfxError();
    if (this.els['l1-board-msg']) {
      this.els['l1-board-msg'].textContent = message;
      this.els['l1-board-msg'].className = 'font-poppins text-[11px] font-semibold text-state-error';
    }
    const shakeTarget = this.els['l1-target-card'] || this.els['l1-board-msg-box'];
    if (shakeTarget) {
      shakeTarget.classList.remove('animate-wa-shake');
      void shakeTarget.offsetWidth;
      shakeTarget.classList.add('animate-wa-shake');
    }
  }

  correctAnswer() {
    this.state.busy = true;
    sfxSuccess();
    ScoreManager.addCorrectAnswer();
    if (this.els['l1-board-msg']) {
      this.els['l1-board-msg'].textContent = 'Sagestremen! Jawabanmu bener.';
      this.els['l1-board-msg'].className = 'font-poppins text-[11px] font-semibold text-state-success';
    }
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
        if (this.els['l1-board-msg']) this.els['l1-board-msg'].textContent = '';
        this.updateChipStates();
        this.clearCanvas();
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
    if (this.els['l1-ornament']) {
      this.els['l1-ornament'].classList.add('hidden');
      this.els['l1-ornament'].classList.remove('flex');
    }
    this.time.delayedCall(300, () => {
      this.els['l1-gate-glow'].classList.remove('hidden');
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
    fadeTransitionOut(this, 500, () => this.scene.start('ResultScene', { level: 1, score, stars }));
  }

  leaveToMap() {
    if (this.state.phase === 'finished') return;
    fadeTransitionOut(this, 350, () => this.scene.start('MapScene'));
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

  openMateriModal() {
    this.showModal(this.els['l1-materi-modal']);
  }

  closeMateriModal() {
    this.hideModal(this.els['l1-materi-modal']);
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
    clearInterval(this.typewriterInterval);
    clearInterval(this.hintInterval);
    this.boundElements?.forEach((element) => { element.onclick = null; });
    if (this.uiContainer) this.uiContainer.innerHTML = '';
    if (this.gameContainer) this.gameContainer.style.backgroundImage = 'none';
  }
}

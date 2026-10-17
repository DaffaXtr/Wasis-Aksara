import Phaser from 'phaser';
import SaveManager from '../managers/SaveManager.js';
import resultTemplate from '../templates/ResultOverlay.html?raw';
import { TOTAL_LEVELS, getLevel } from '../data/levelData.js';
import { showItemReward } from '../ui/overlayKit.js';
import { fadeTransitionIn, fadeTransitionOut } from '../utils/transition.js';

/**
 * ResultScene: Papan skor per level — skor, bintang, rekap jawaban bener, lalu item hadiah.
 * Setelah level terakhir, lanjut ke rekap petualangan (EndingScene), bukan ke peta.
 *
 * Data dari level: { level, score, stars, answers }
 * answers: [{ question, playerAnswer, playerImage?, correctAnswer, correct, note? }]
 *   question → teks Latin/biasa, playerAnswer & correctAnswer → teks aksara Jawa,
 *   playerImage → data URL goresan papan tulis (hanya ditampilkan, tidak disimpan).
 */
export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create(data = {}) {
    fadeTransitionIn(this, 500);

    const level = data.level || 1;
    const score = data.score || 0;
    const stars = data.stars || 0;
    const answers = data.answers || [];
    const levelInfo = getLevel(level);

    const { newItem } = SaveManager.recordLevelResult(level, { score, stars, answers });

    this.gameContainer = document.getElementById('wasis-aksara-game')?.parentElement;
    if (this.gameContainer) {
      this.gameContainer.style.backgroundImage = "linear-gradient(rgba(20,18,15,.72), rgba(20,18,15,.72)), url('/assets/images/Bg_CandiTikusNew.webp')";
      this.gameContainer.style.backgroundSize = 'cover';
      this.gameContainer.style.backgroundPosition = 'center';
    }

    this.uiContainer = document.getElementById('ui-overlay-container');
    if (this.uiContainer) this.uiContainer.innerHTML = resultTemplate;
    const $ = (id) => document.getElementById(id);

    $('result-level').textContent = `Level ${level} · ${levelInfo?.title || ''}`;
    $('result-score').textContent = score;
    $('result-stars').innerHTML = [0, 1, 2]
      .map((index) => `<span class="${index < stars ? 'text-majapahit-gold' : 'text-stone-light'}">★</span>`)
      .join('');
    $('result-correct').textContent = `${answers.filter((answer) => answer.correct).length} / ${answers.length}`;
    this.renderAnswers($('result-answers'), $('result-empty'), answers);

    const overlay = $('result-overlay');
    requestAnimationFrame(() => overlay.classList.replace('opacity-0', 'opacity-100'));

    const nextButton = $('result-btn-next');
    nextButton.onclick = async () => {
      nextButton.onclick = null;
      if (levelInfo?.reward) await showItemReward(levelInfo.reward, { isNew: newItem });
      overlay.classList.replace('opacity-100', 'opacity-0');
      fadeTransitionOut(this, 500, () => this.scene.start(level === TOTAL_LEVELS ? 'EndingScene' : 'MapScene'));
    };

    this.events.once('shutdown', () => {
      if (this.uiContainer) this.uiContainer.innerHTML = '';
      if (this.gameContainer) this.gameContainer.style.backgroundImage = 'none';
    });
  }

  renderAnswers(list, emptyState, answers) {
    if (!answers.length) {
      list.classList.add('hidden');
      emptyState.classList.replace('hidden', 'flex');
      return;
    }

    answers.forEach((answer, index) => {
      const row = document.createElement('div');
      row.className = `grid grid-cols-[36px_1fr_1fr_1fr_36px] items-center gap-3 rounded-lg border px-3 py-1.5 ${answer.correct ? 'border-state-success/40 bg-state-success/10' : 'border-state-error/40 bg-state-error/10'}`;

      const cells = [
        [String(index + 1), 'font-cinzel text-[14px] font-bold text-majapahit-light-gold'],
        [answer.question, 'font-poppins text-[13px] font-semibold text-majapahit-cream'],
        [answer.playerAnswer || '—', `font-local-javanese pt-1 pb-4 text-[22px] leading-none break-words ${answer.correct ? 'text-[#bfe3bf]' : 'text-[#f0b5ad] line-through decoration-1'}`],
        [answer.correctAnswer, 'font-local-javanese pt-1 pb-4 text-[22px] leading-none break-words text-majapahit-light-gold'],
        [answer.correct ? '✓' : '✗', `text-center text-[18px] font-bold ${answer.correct ? 'text-state-success' : 'text-state-error'}`]
      ];
      cells.forEach(([text, className], cellIndex) => {
        // Level papan tulis mengirim goresan pemain sebagai gambar.
        // (pt/pb pada sel aksara memberi ruang untuk pasangan & sandhangan atas)
        if (cellIndex === 2 && answer.playerImage) {
          const image = document.createElement('img');
          image.src = answer.playerImage;
          image.alt = 'Tulisanmu';
          image.className = `h-11 w-full rounded border bg-[#241c16] object-contain p-1 ${answer.correct ? 'border-state-success/50' : 'border-state-error/50'}`;
          row.appendChild(image);
          return;
        }
        const cell = document.createElement('span');
        cell.className = className;
        cell.textContent = text;
        // Catatan opsional (mis. alasan kesalahan) di bawah teks pitakon
        if (cellIndex === 1 && answer.note) {
          const note = document.createElement('span');
          note.className = 'mt-0.5 block text-[10.5px] font-normal italic text-[#f0b5ad]';
          note.textContent = answer.note;
          cell.appendChild(note);
        }
        row.appendChild(cell);
      });
      list.appendChild(row);
    });
  }
}

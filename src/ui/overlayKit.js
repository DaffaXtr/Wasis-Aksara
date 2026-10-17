import AudioManager from '../managers/AudioManager.js';
import { getCandi, getLevel } from '../data/levelData.js';
import { sfxError, sfxOpen, sfxReward, sfxSuccess } from '../utils/sfx.js';

/**
 * overlayKit: Komponen DOM bersama untuk semua level (popup sejarah, feedback jawaban, item hadiah).
 * Semua elemen ditempel ke #ui-overlay-container (kanvas UI 1280×720) dan dihapus setelah selesai.
 * Setiap fungsi mengembalikan Promise yang selesai saat pemain menutup komponen.
 */

function mount(html) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  const element = wrapper.firstElementChild;
  document.getElementById('ui-overlay-container')?.appendChild(element);
  return element;
}

function openModal(element) {
  requestAnimationFrame(() => element.classList.replace('opacity-0', 'opacity-100'));
}

function closeModal(element, resolve, value) {
  element.classList.replace('opacity-100', 'opacity-0');
  setTimeout(() => {
    element.remove();
    resolve(value);
  }, 300);
}

const CUBE_ICON = '<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>';
const MEDIA_BUTTON = 'absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap rounded-lg border border-majapahit-gold bg-stone-dark/90 px-4 py-2 font-poppins text-[12px] font-bold uppercase tracking-widest text-majapahit-light-gold shadow-lg transition hover:scale-105 hover:text-majapahit-cream active:scale-95 cursor-pointer';

/**
 * Tombol "Deleng 3D" di atas gambar candi. <model-viewer> (beserta three.js) baru dimuat setelah
 * tombol ditekan, supaya popup tetap ringan. Model .glb bisa diputar dan dibuka di AR (HP);
 * versi scan Sketchfab bisa dibuka dari tautan di bawah viewer bila ada internet.
 */
function mountModel3d(media, credit, candi) {
  const button = document.createElement('button');
  button.className = MEDIA_BUTTON;
  button.innerHTML = `${CUBE_ICON}Deleng 3D`;
  button.onclick = async () => {
    button.disabled = true;
    button.textContent = 'Ngemot…';
    try {
      await import('@google/model-viewer');
    } catch (error) {
      console.warn('model-viewer gagal dimuat:', error);
      button.textContent = 'Model 3D gagal dimuat';
      return;
    }
    const viewer = document.createElement('model-viewer');
    Object.entries({
      src: candi.model3d.src,
      alt: `Model 3D ${candi.name}`,
      'camera-controls': '',
      'touch-action': 'none',
      'auto-rotate': '',
      'auto-rotate-delay': '2000',
      'camera-orbit': '25deg 58deg 80%',
      'shadow-intensity': '1',
      exposure: '1.1',
      ar: '',
      'ar-modes': 'webxr scene-viewer quick-look',
      'ar-scale': 'auto'
    }).forEach(([name, value]) => viewer.setAttribute(name, value));
    viewer.className = 'h-full w-full';
    viewer.style.backgroundColor = 'transparent';
    // Tombol AR hanya ditampilkan model-viewer bila perangkat mendukung AR
    const arButton = document.createElement('button');
    arButton.slot = 'ar-button';
    arButton.className = MEDIA_BUTTON;
    arButton.innerHTML = `${CUBE_ICON}Deleng ing AR`;
    viewer.appendChild(arButton);
    media.replaceChildren(viewer);

    if (candi.model3d.scan) showScanLink(media, credit, candi);
  };
  media.appendChild(button);
}

function showScanLink(media, credit, candi) {
  const { scan } = candi.model3d;
  const link = document.createElement('button');
  link.className = 'cursor-pointer underline decoration-dotted underline-offset-2 hover:text-majapahit-light-gold';
  link.textContent = 'Deleng versi scan asli (butuh internet)';
  link.onclick = () => {
    if (!navigator.onLine) {
      link.textContent = 'Butuh sambungan internet';
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.title = candi.name;
    iframe.src = `${scan.embedUrl}?autostart=1&ui_theme=dark&dnt=1`;
    iframe.allow = 'autoplay; fullscreen; xr-spatial-tracking';
    iframe.allowFullscreen = true;
    iframe.className = 'h-full w-full border-0';
    media.replaceChildren(iframe);
    credit.textContent = scan.credit;
  };
  credit.replaceChildren(link);
  credit.classList.remove('hidden');
}

/**
 * Popup sejarah candi yang tampil sebelum tantangan level dimulai.
 */
export function showHistoryPopup(level) {
  const candi = getCandi(level);
  const levelInfo = getLevel(level);
  const modal = mount(`
    <div class="wa-modal-container z-60 opacity-0 transition-opacity duration-300">
      <div class="bg-stone-dark/98 flex h-[520px] w-[920px] flex-col rounded-2xl border-2 border-majapahit-gold p-7 shadow-[0_15px_40px_rgba(0,0,0,0.85)]">
        <div class="flex items-baseline justify-between border-b border-majapahit-dark-gold/50 pb-3">
          <div>
            <p data-slot="level" class="font-poppins text-[11px] font-bold uppercase tracking-widest text-majapahit-light-gold/80"></p>
            <h2 data-slot="name" class="font-cinzel text-[26px] font-bold uppercase tracking-wider text-majapahit-light-gold"></h2>
          </div>
          <span data-slot="location" class="font-marcellus text-sm text-majapahit-cream/80"></span>
        </div>
        <div class="mt-4 flex min-h-0 flex-1 gap-6">
          <div class="flex w-[400px] shrink-0 flex-col gap-1.5">
            <div data-slot="media" class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-majapahit-gold/40 bg-stone-dark/80"></div>
            <p data-slot="credit" class="hidden text-center font-poppins text-[10px] text-stone-soft/60"></p>
          </div>
          <div data-slot="history" class="flex-1 space-y-3 overflow-y-auto pr-2 font-poppins text-[14px] leading-relaxed text-stone-soft"></div>
        </div>
        <div class="mt-4 flex justify-end">
          <button data-slot="next" class="kenney-button h-11 w-[180px] cursor-pointer font-poppins text-[13px] font-bold uppercase tracking-widest text-stone-dark transition hover:scale-105 active:scale-95">Lanjut ›</button>
        </div>
      </div>
    </div>`);

  const slot = (name) => modal.querySelector(`[data-slot="${name}"]`);
  slot('level').textContent = `Level ${level} · ${levelInfo?.title || ''}`;
  slot('name').textContent = `Sejarah ${candi?.name || ''}`;
  slot('location').textContent = candi?.location || '';
  candi?.history.forEach((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    slot('history').appendChild(p);
  });
  if (candi?.image) {
    const image = document.createElement('img');
    image.src = candi.image;
    image.alt = candi.name;
    image.className = 'h-full w-full object-contain p-3 animate-wa-float';
    slot('media').appendChild(image);
  }
  if (candi?.model3d) mountModel3d(slot('media'), slot('credit'), candi);

  sfxOpen();
  openModal(modal);
  return new Promise((resolve) => {
    slot('next').onclick = () => closeModal(modal, resolve);
  });
}

/**
 * Umpan balik setelah pemain menjawab: "Wangsulanmu Bener" / "Wangsulanmu Salah".
 * Tampil sebentar lalu hilang sendiri.
 */
export function showFeedback(correct, { duration = 1400 } = {}) {
  const toast = mount(`
    <div class="pointer-events-none absolute inset-0 z-70 flex items-center justify-center opacity-0 transition-opacity duration-200">
      <div class="animate-wa-pop flex flex-col items-center gap-2 rounded-2xl border-2 bg-stone-dark/95 px-12 py-6 shadow-[0_10px_40px_rgba(0,0,0,.75)]">
        <span data-slot="icon" class="flex h-16 w-16 items-center justify-center rounded-full text-[36px] font-bold text-stone-dark"></span>
        <p data-slot="text" class="font-cinzel text-[26px] font-bold tracking-wider"></p>
      </div>
    </div>`);

  const card = toast.firstElementChild;
  const icon = toast.querySelector('[data-slot="icon"]');
  const text = toast.querySelector('[data-slot="text"]');
  card.classList.add(correct ? 'border-state-success' : 'border-state-error');
  icon.classList.add(correct ? 'bg-state-success' : 'bg-state-error');
  icon.textContent = correct ? '✓' : '✗';
  text.classList.add(correct ? 'text-[#bfe3bf]' : 'text-[#f0b5ad]');
  text.textContent = correct ? 'Wangsulanmu Bener' : 'Wangsulanmu Salah';

  (correct ? sfxSuccess : sfxError)();
  openModal(toast);
  return new Promise((resolve) => {
    setTimeout(() => closeModal(toast, resolve), duration);
  });
}

const KEYBOARD_TUTORIAL = [
  {
    title: 'Milih Jinis Aksara',
    text: 'Pilih tab Legena, Sandhangan, utawa Pasangan ing ndhuwur keyboard, banjur klik aksarane.',
    demo: 'ꦲ ꦤ ꦕ ꦫ ꦏ'
  },
  {
    title: 'Aksara Dhisik, Sandhangan Banjur',
    text: 'Ketik aksarane dhisik, banjur sandhangane. Taling diketik sawise aksara sanajan katon ing ngarep.',
    demo: 'ꦏ + ꦲꦶ → ꦏꦶ     ꦏ + ꦲꦺ → ꦏꦺ'
  },
  {
    title: 'Pasangan lan Pangkon',
    text: 'Aksara mati ing tengah tembung: ketik aksarane, banjur pilih pasangan saka tab Pasangan. Pangkon mung kanggo aksara mati ing pungkasan. Tombol ⌫ mbusak siji ketikan.',
    demo: 'ꦕꦤ + ꦲ꧀ꦢ + ꦶ → ꦕꦤ꧀ꦢꦶ'
  }
];

/**
 * Tutorial singkat cara mengetik dengan keyboard aksara.
 */
export function showKeyboardTutorial() {
  const modal = mount(`
    <div class="wa-modal-container z-60 opacity-0 transition-opacity duration-300">
      <div class="flex h-[400px] w-[640px] flex-col rounded-2xl border-2 border-majapahit-gold bg-stone-dark/98 p-7 text-center shadow-[0_15px_40px_rgba(0,0,0,0.85)]">
        <p class="font-poppins text-[10px] font-bold uppercase tracking-widest text-majapahit-light-gold/80">Tutorial Keyboard Aksara · <span data-slot="step"></span></p>
        <h2 data-slot="title" class="mt-1 font-cinzel text-[22px] font-bold tracking-wider text-majapahit-light-gold"></h2>
        <div class="mt-5 flex min-h-[96px] items-center justify-center rounded-xl border border-majapahit-gold/40 bg-[#251d16] px-4">
          <p data-slot="demo" class="whitespace-pre pb-4 pt-2 font-local-javanese text-[34px] leading-none text-majapahit-cream"></p>
        </div>
        <p data-slot="text" class="mt-4 flex-1 font-poppins text-[14px] leading-relaxed text-stone-soft"></p>
        <div class="flex items-center justify-between">
          <button data-slot="prev" class="wa-util h-10 w-[130px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">‹ Sadurunge</button>
          <button data-slot="next" class="kenney-button h-11 w-[170px] cursor-pointer font-poppins text-[12px] font-bold uppercase tracking-widest text-stone-dark transition hover:scale-105 active:scale-95"></button>
        </div>
      </div>
    </div>`);

  const slot = (name) => modal.querySelector(`[data-slot="${name}"]`);
  let step = 0;
  const show = () => {
    const item = KEYBOARD_TUTORIAL[step];
    slot('step').textContent = `${step + 1} / ${KEYBOARD_TUTORIAL.length}`;
    slot('title').textContent = item.title;
    slot('demo').textContent = item.demo;
    slot('text').textContent = item.text;
    slot('prev').disabled = step === 0;
    slot('next').textContent = step === KEYBOARD_TUTORIAL.length - 1 ? 'Ngerti' : 'Sabanjure ›';
  };

  sfxOpen();
  show();
  openModal(modal);
  return new Promise((resolve) => {
    slot('prev').onclick = () => { if (step > 0) { step -= 1; show(); } };
    slot('next').onclick = () => {
      if (step < KEYBOARD_TUTORIAL.length - 1) { step += 1; show(); } else closeModal(modal, resolve);
    };
  });
}

/**
 * Dialog konfirmasi (mis. keluar level, busak progres).
 * @returns {Promise<boolean>} true jika pemain memilih tombol konfirmasi
 */
export function showConfirm({ title, text, confirmLabel = 'Ya', cancelLabel = 'Batal' }) {
  const modal = mount(`
    <div class="wa-modal-container z-80 opacity-0 transition-opacity duration-300">
      <div class="bg-stone-dark/98 w-[460px] rounded-2xl border-2 border-majapahit-gold p-7 text-center shadow-[0_15px_40px_rgba(0,0,0,0.85)]">
        <h2 data-slot="title" class="font-cinzel text-[22px] font-bold tracking-wider text-majapahit-light-gold"></h2>
        <p data-slot="text" class="mt-3 mb-6 font-poppins text-[13px] leading-relaxed text-stone-soft"></p>
        <div class="flex items-center justify-center gap-4">
          <button data-slot="cancel" class="wa-util h-11 w-[160px]"></button>
          <button data-slot="confirm" class="kenney-button h-11 w-[160px] cursor-pointer font-poppins text-[12px] font-bold uppercase tracking-widest text-stone-dark transition hover:scale-105 active:scale-95"></button>
        </div>
      </div>
    </div>`);

  const slot = (name) => modal.querySelector(`[data-slot="${name}"]`);
  slot('title').textContent = title;
  slot('text').textContent = text;
  slot('confirm').textContent = confirmLabel;
  slot('cancel').textContent = cancelLabel;

  sfxOpen();
  openModal(modal);
  return new Promise((resolve) => {
    const answer = (value) => {
      slot('confirm').onclick = slot('cancel').onclick = null;
      closeModal(modal, resolve, value);
    };
    slot('confirm').onclick = () => answer(true);
    slot('cancel').onclick = () => answer(false);
  });
}

/**
 * Konfirmasi sebelum keluar level, agar sentuhan tak sengaja tidak menghapus progres level.
 */
export function confirmLeaveLevel() {
  return showConfirm({
    title: 'Metu saka Level?',
    text: 'Wangsulan lan skor ing level iki durung disimpen lan bakal ilang yen kowe metu saiki.',
    confirmLabel: 'Metu',
    cancelLabel: 'Tetep Dolanan'
  });
}

const AUDIO_ON_ICON = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>';
const AUDIO_OFF_ICON = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';

/**
 * Tombol Swara di HUD level, dipasang tepat sebelum tombol keluar dengan gaya yang sama.
 * @param {HTMLElement} exitButton
 */
export function addAudioToggle(exitButton) {
  if (!exitButton) return;
  const button = document.createElement('button');
  button.className = exitButton.className;
  button.title = 'Swara';
  button.setAttribute('aria-label', 'Swara');
  const render = () => {
    button.innerHTML = `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${AudioManager.isMuted ? AUDIO_OFF_ICON : AUDIO_ON_ICON}</svg>`;
  };
  button.onclick = () => {
    AudioManager.toggleMute();
    render();
  };
  render();
  exitButton.before(button);
}

/**
 * Modal item hadiah setelah papan skor.
 * @param {{ name: string, icon: string }} item
 * @param {{ isNew?: boolean }} options - false bila item sudah pernah didapat (main ulang)
 */
export function showItemReward(item, { isNew = true } = {}) {
  const modal = mount(`
    <div class="wa-modal-container z-60 opacity-0 transition-opacity duration-500">
      <div class="bg-stone-dark/98 w-[460px] rounded-2xl border-2 border-majapahit-gold p-7 text-center shadow-[0_15px_40px_rgba(0,0,0,0.85)]">
        <h2 data-slot="title" class="font-cinzel text-[22px] font-bold uppercase tracking-widest text-majapahit-light-gold"></h2>
        <div class="relative mx-auto my-4 flex h-[150px] w-[150px] items-center justify-center">
          <div class="absolute inset-0 rounded-full bg-majapahit-gold/25 animate-wa-pulse-glow"></div>
          <span data-slot="icon" class="relative animate-wa-pop text-[86px] leading-none"></span>
        </div>
        <h3 data-slot="name" class="font-cinzel text-[18px] font-bold uppercase tracking-wider text-majapahit-gold"></h3>
        <p data-slot="text" class="mt-1 mb-5 font-poppins text-[12px] leading-relaxed text-stone-soft"></p>
        <button data-slot="claim" class="kenney-button h-11 w-[220px] cursor-pointer font-poppins text-[12px] font-bold uppercase tracking-widest text-stone-dark transition hover:scale-105 active:scale-95">Tampa Item</button>
      </div>
    </div>`);

  const slot = (name) => modal.querySelector(`[data-slot="${name}"]`);
  slot('title').textContent = isNew ? 'Item Anyar!' : 'Item Wis Diduweni';
  slot('icon').textContent = item.icon;
  slot('name').textContent = item.name;
  slot('text').textContent = isNew
    ? `Kowe entuk ${item.name}. Item iki bakal mbantu lakumu ing tantangan sabanjure.`
    : `${item.name} wis ana ing tasmu.`;

  sfxReward();
  openModal(modal);
  return new Promise((resolve) => {
    slot('claim').onclick = () => closeModal(modal, resolve);
  });
}

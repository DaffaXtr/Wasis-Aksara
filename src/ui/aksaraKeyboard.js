import { aksaraData } from '../data/aksaraData.js';

/**
 * aksaraKeyboard: Keyboard aksara Jawa di layar (Level 3 & TTS Level 4).
 * Ketikan disimpan per tombol, sehingga ⌫ menghapus satu ketikan utuh
 * (mis. pasangan = pangkon + aksara dihapus sekaligus).
 *
 * Urutan Unicode: aksara dulu, lalu sandhangan (taling tetap diketik sesudah aksara
 * meski tampil di depannya). Pasangan = pangkon + aksara; tombol Pangkon menyisipkan
 * pangkon + ZWNJ agar pangkon tampil dan tidak berubah menjadi pasangan.
 */

const ZWNJ = String.fromCharCode(0x200c);
const PANGKON = aksaraData.sandhangan.find((item) => item.latin === 'pangkon').aksara;
const CARRIER = 'ꦲ'; // aksara pembawa untuk menampilkan sandhangan/pasangan pada tombol

const TABS = {
  legena: {
    label: 'Legena',
    keys: aksaraData.legena.map(({ latin, aksara }) => ({ insert: aksara, glyph: aksara, latin }))
  },
  sandhangan: {
    label: 'Sandhangan',
    keys: aksaraData.sandhangan
      .filter((item) => item.aksara !== PANGKON)
      .map(({ latin, aksara }) => ({ insert: aksara, glyph: CARRIER + aksara, latin: latin.split(' (')[0] }))
  },
  pasangan: {
    label: 'Pasangan',
    keys: aksaraData.pasangan.map(({ latin, aksara }) => ({ insert: aksara, glyph: CARRIER + aksara, latin: `+${latin}` }))
  }
};

const EXTRA_KEYS = [
  { insert: PANGKON + ZWNJ, glyph: CARRIER + PANGKON, latin: 'pangkon' },
  { action: 'backspace', label: '⌫', latin: 'busak siji' },
  { insert: aksaraData.pada[0].aksara, glyph: aksaraData.pada[0].aksara, latin: 'lingsa' },
  { insert: aksaraData.pada[1].aksara, glyph: aksaraData.pada[1].aksara, latin: 'lungsi' },
  { action: 'clear', label: 'Busak kabeh', latin: '', wide: true }
];

/**
 * @param {{ onChange?: (value: string) => void }} options
 * @returns {{ element: HTMLElement, readonly value: string, clear(): void, setDisabled(disabled: boolean): void }}
 */
export function createAksaraKeyboard({ onChange = () => {} } = {}) {
  let tokens = [];
  let disabled = false;

  const root = document.createElement('div');
  root.className = 'flex gap-3';
  root.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex gap-1.5" data-slot="tabs"></div>
      <div class="grid grid-cols-10 gap-1.5" data-slot="keys"></div>
    </div>
    <div class="grid w-[150px] grid-cols-2 content-end gap-1.5" data-slot="extra"></div>`;
  const tabsEl = root.querySelector('[data-slot="tabs"]');
  const keysEl = root.querySelector('[data-slot="keys"]');
  const extraEl = root.querySelector('[data-slot="extra"]');

  const emit = () => onChange(tokens.join(''));
  const press = (key) => {
    if (disabled) return;
    if (key.action === 'backspace') tokens.pop();
    else if (key.action === 'clear') tokens = [];
    else tokens.push(key.insert);
    emit();
  };

  const makeKey = (key) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `wa-kb-key${key.wide ? ' col-span-2' : ''}${key.action ? ' wa-kb-action' : ''}`;
    button.innerHTML = key.action
      ? `<span class="font-poppins text-[13px] font-bold">${key.label}</span>${key.latin ? `<span class="wa-kb-latin">${key.latin}</span>` : ''}`
      : `<span class="wa-kb-glyph"></span><span class="wa-kb-latin"></span>`;
    if (!key.action) {
      button.querySelector('.wa-kb-glyph').textContent = key.glyph;
      button.querySelector('.wa-kb-latin').textContent = key.latin;
    }
    button.title = key.latin || key.label;
    button.onclick = () => press(key);
    return button;
  };

  const showTab = (name) => {
    [...tabsEl.children].forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === name));
    keysEl.replaceChildren(...TABS[name].keys.map(makeKey));
  };

  Object.entries(TABS).forEach(([name, tab]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wa-kb-tab';
    button.dataset.tab = name;
    button.textContent = tab.label;
    button.onclick = () => showTab(name);
    tabsEl.appendChild(button);
  });
  extraEl.replaceChildren(...EXTRA_KEYS.map(makeKey));
  showTab('legena');

  return {
    element: root,
    get value() { return tokens.join(''); },
    clear() { tokens = []; emit(); },
    setDisabled(value) {
      disabled = value;
      root.classList.toggle('opacity-50', value);
      root.classList.toggle('pointer-events-none', value);
    }
  };
}

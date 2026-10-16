import { capaianPembelajaran, materi, pandhuanDolanan, profilPangembang, tujuanPembelajaran } from '../data/menuData.js';

/**
 * menuPanels: Pengisi modal informasi menu utama (#menu-info-modal).
 * Setiap panel menerima { body, footer, close } dan mengembalikan { title, subtitle }.
 */

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const CARD = 'rounded-xl border border-majapahit-dark-gold/70 bg-[#251d16] p-4';

export function renderCP({ body }) {
  body.innerHTML = `
    <div class="${CARD} p-6">
      <span class="inline-block rounded-md border border-majapahit-gold/60 bg-majapahit-gold/15 px-3 py-1 font-poppins text-[11px] font-bold uppercase tracking-widest text-majapahit-light-gold">${escapeHtml(capaianPembelajaran.fase)}</span>
      <p class="mt-4 text-justify font-poppins text-[14px] leading-[1.9] text-stone-soft">${escapeHtml(capaianPembelajaran.text)}</p>
    </div>`;
  return { title: 'Capaian Pembelajaran', subtitle: `CP · ${capaianPembelajaran.fase}` };
}

export function renderTP({ body }) {
  body.innerHTML = `<div class="space-y-3">${tujuanPembelajaran.map((text, index) => `
    <div class="${CARD} flex items-start gap-4">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-majapahit-gold bg-stone-dark font-cinzel text-[18px] font-bold text-majapahit-light-gold">${index + 1}</span>
      <p class="pt-1.5 font-poppins text-[14px] leading-relaxed text-stone-soft">${escapeHtml(text)}</p>
    </div>`).join('')}</div>`;
  return { title: 'Tujuan Pembelajaran', subtitle: 'TP' };
}

export function renderProfil({ body }) {
  const initials = profilPangembang.name.split(' ').map((word) => word[0]).join('').slice(0, 2);
  body.innerHTML = `
    <div class="flex h-full items-center justify-center gap-10">
      <div class="relative flex h-[260px] w-[220px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-majapahit-gold bg-stone-dark shadow-[0_8px_24px_rgba(0,0,0,.6)]">
        <span class="font-cinzel text-[64px] font-bold text-majapahit-gold/70">${escapeHtml(initials)}</span>
        <img data-slot="photo" alt="Foto ${escapeHtml(profilPangembang.name)}" class="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div class="flex flex-col gap-4">
        <div>
          <p class="font-poppins text-[10px] font-bold uppercase tracking-widest text-majapahit-light-gold/70">Pangembang</p>
          <h3 class="font-cinzel text-[30px] font-bold tracking-wider text-majapahit-cream">${escapeHtml(profilPangembang.name)}</h3>
        </div>
        <div class="h-0.5 w-32 bg-linear-to-r from-majapahit-gold to-transparent"></div>
        <p class="font-poppins text-[16px] font-semibold text-majapahit-light-gold">${escapeHtml(profilPangembang.program)}</p>
        <p class="font-poppins text-[14px] text-stone-soft">${escapeHtml(profilPangembang.university)}</p>
      </div>
    </div>`;
  // Foto opsional: jika berkas belum ada, inisial di belakangnya tetap terlihat.
  const photo = body.querySelector('[data-slot="photo"]');
  photo.addEventListener('error', () => photo.remove(), { once: true });
  photo.src = profilPangembang.photo;
  return { title: 'Profil Pangembang', subtitle: 'Tentang' };
}

export function renderMateri({ body }) {
  body.innerHTML = `<div class="space-y-3">${materi.map((item, index) => `
    <div class="${CARD} grid grid-cols-[1fr_1.15fr] gap-5">
      <div class="flex items-start gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-majapahit-gold bg-stone-dark font-cinzel text-[16px] font-bold text-majapahit-light-gold">${index + 1}</span>
        <div>
          <h3 class="font-cinzel text-[15px] font-bold tracking-wide text-majapahit-light-gold">${escapeHtml(item.title)}</h3>
          <p class="mt-1 font-poppins text-[12.5px] leading-relaxed text-stone-soft">${escapeHtml(item.rule)}</p>
        </div>
      </div>
      <div class="space-y-1.5">${item.examples.map((example) => `
        <div class="flex items-center justify-between gap-3 rounded-lg border border-stone-light/40 bg-stone-dark/70 px-3 py-1.5">
          <div class="flex flex-col">
            <span class="font-poppins text-[12px] font-semibold text-majapahit-cream">${escapeHtml(example.latin)}</span>
            ${example.note ? `<span class="font-poppins text-[10px] text-majapahit-light-gold/70">${escapeHtml(example.note)}</span>` : ''}
          </div>
          <!-- Ruang bawah untuk pasangan yang turun di bawah garis dasar -->
          <span class="font-local-javanese whitespace-nowrap pt-3 pb-7 text-[24px] leading-none text-majapahit-light-gold">${escapeHtml(example.aksara)}</span>
        </div>`).join('')}
      </div>
    </div>`).join('')}</div>`;
  return { title: 'Materi Aksara Jawa', subtitle: 'Pasangan lan Kaidah Panulisan' };
}

export function renderPandhuan({ body, footer, close }) {
  let step = 0;
  const NAV_BUTTON = 'wa-util h-10 w-[130px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40';

  footer.innerHTML = `
    <button data-slot="prev" class="${NAV_BUTTON}">‹ Sadurunge</button>
    <div data-slot="dots" class="flex gap-2">${pandhuanDolanan.map(() => '<span class="h-2.5 w-2.5 rounded-full transition-all duration-300"></span>').join('')}</div>
    <button data-slot="next" class="kenney-button h-11 w-[160px] cursor-pointer font-poppins text-[12px] font-bold uppercase tracking-widest text-stone-dark transition hover:scale-105 active:scale-95"></button>`;
  footer.classList.replace('hidden', 'flex');

  const prev = footer.querySelector('[data-slot="prev"]');
  const next = footer.querySelector('[data-slot="next"]');
  const dots = [...footer.querySelector('[data-slot="dots"]').children];

  const show = () => {
    const item = pandhuanDolanan[step];
    body.innerHTML = `
      <div class="flex h-full flex-col items-center justify-center px-16 text-center">
        <div class="animate-wa-pop flex h-28 w-28 items-center justify-center rounded-full border-2 border-majapahit-gold bg-stone-dark text-[52px] shadow-[0_0_30px_rgba(212,166,74,.35)]">${escapeHtml(item.icon)}</div>
        <p class="mt-5 font-poppins text-[11px] font-bold uppercase tracking-widest text-majapahit-light-gold/70">Langkah ${step + 1} / ${pandhuanDolanan.length}</p>
        <h3 class="mt-1 font-cinzel text-[24px] font-bold tracking-wider text-majapahit-cream">${escapeHtml(item.title)}</h3>
        <p class="mt-3 max-w-[620px] font-poppins text-[14.5px] leading-relaxed text-stone-soft">${escapeHtml(item.text)}</p>
      </div>`;
    prev.disabled = step === 0;
    next.textContent = step === pandhuanDolanan.length - 1 ? 'Rampung' : 'Sabanjure ›';
    dots.forEach((dot, index) => {
      dot.className = `h-2.5 rounded-full transition-all duration-300 ${index === step ? 'w-6 bg-majapahit-gold' : 'w-2.5 bg-stone-light'}`;
    });
  };

  prev.onclick = () => { if (step > 0) { step -= 1; show(); } };
  next.onclick = () => {
    if (step < pandhuanDolanan.length - 1) { step += 1; show(); } else close();
  };
  show();
  return { title: 'Pandhuan Dolanan', subtitle: 'Tutorial' };
}

export function renderEvaluasi({ body }) {
  body.innerHTML = `
    <div class="flex h-full flex-col items-center justify-center text-center">
      <div class="flex h-24 w-24 items-center justify-center rounded-full border-2 border-majapahit-gold bg-stone-dark text-[44px]">📝</div>
      <h3 class="mt-5 font-cinzel text-[22px] font-bold tracking-wider text-majapahit-cream">Evaluasi Durung Kasedhiya</h3>
      <p class="mt-2 max-w-[520px] font-poppins text-[14px] leading-relaxed text-stone-soft">Soal evaluasi babagan aksara Jawa lagi disiapake. Sauntara iki, ayo rampungna petualangan ing candi-candi dhisik!</p>
    </div>`;
  return { title: 'Evaluasi', subtitle: 'Uji Kawasisan' };
}

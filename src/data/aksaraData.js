/**
 * aksaraData: Pemetaan Latin → Aksara Jawa (Unicode blok U+A980–U+A9DF).
 * Dipakai oleh keyboard aksara (Level 3 & 4) dan halaman Materi.
 */
export const aksaraData = {
  legena: [
    { latin: 'ha', aksara: 'ꦲ' }, { latin: 'na', aksara: 'ꦤ' }, { latin: 'ca', aksara: 'ꦕ' }, { latin: 'ra', aksara: 'ꦫ' }, { latin: 'ka', aksara: 'ꦏ' },
    { latin: 'da', aksara: 'ꦢ' }, { latin: 'ta', aksara: 'ꦠ' }, { latin: 'sa', aksara: 'ꦱ' }, { latin: 'wa', aksara: 'ꦮ' }, { latin: 'la', aksara: 'ꦭ' },
    { latin: 'pa', aksara: 'ꦥ' }, { latin: 'dha', aksara: 'ꦝ' }, { latin: 'ja', aksara: 'ꦗ' }, { latin: 'ya', aksara: 'ꦪ' }, { latin: 'nya', aksara: 'ꦚ' },
    { latin: 'ma', aksara: 'ꦩ' }, { latin: 'ga', aksara: 'ꦒ' }, { latin: 'ba', aksara: 'ꦧ' }, { latin: 'tha', aksara: 'ꦛ' }, { latin: 'nga', aksara: 'ꦔ' }
  ],
  sandhangan: [
    { latin: 'wulu (i)', aksara: 'ꦶ' },
    { latin: 'suku (u)', aksara: 'ꦸ' },
    { latin: 'taling (é)', aksara: 'ꦺ' },
    { latin: 'pepet (e)', aksara: 'ꦼ' },
    { latin: 'taling tarung (o)', aksara: 'ꦺꦴ' },
    { latin: 'layar (r)', aksara: 'ꦂ' },
    { latin: 'cecak (ng)', aksara: 'ꦁ' },
    { latin: 'wignyan (h)', aksara: 'ꦃ' },
    { latin: 'cakra (ra)', aksara: 'ꦿ' },
    { latin: 'keret (re)', aksara: 'ꦽ' },
    { latin: 'pengkal (ya)', aksara: 'ꦾ' },
    { latin: 'pangkon', aksara: '꧀' }
  ],
  // Pasangan = pangkon (U+A9C0) + aksara legena; font merender sebagai pasangan.
  pasangan: [
    'ha', 'na', 'ca', 'ra', 'ka', 'da', 'ta', 'sa', 'wa', 'la',
    'pa', 'dha', 'ja', 'ya', 'nya', 'ma', 'ga', 'ba', 'tha', 'nga'
  ].map((latin, index) => ({ latin, aksara: `꧀${'ꦲꦤꦕꦫꦏꦢꦠꦱꦮꦭꦥꦝꦗꦪꦚꦩꦒꦧꦛꦔ'[index]}` })),
  murda: [
    { latin: 'Na', aksara: 'ꦟ' }, { latin: 'Ka', aksara: 'ꦑ' }, { latin: 'Ta', aksara: 'ꦡ' }, { latin: 'Sa', aksara: 'ꦯ' },
    { latin: 'Pa', aksara: 'ꦦ' }, { latin: 'Nya', aksara: 'ꦘ' }, { latin: 'Ga', aksara: 'ꦓ' }, { latin: 'Ba', aksara: 'ꦨ' }
  ],
  rekan: [
    { latin: 'kha', aksara: 'ꦏ꦳' }, { latin: 'dza', aksara: 'ꦢ꦳' }, { latin: 'fa/va', aksara: 'ꦥ꦳' },
    { latin: 'za', aksara: 'ꦗ꦳' }, { latin: 'gha', aksara: 'ꦒ꦳' }
  ],
  swara: [
    { latin: 'A', aksara: 'ꦄ' }, { latin: 'I', aksara: 'ꦆ' }, { latin: 'U', aksara: 'ꦈ' }, { latin: 'É', aksara: 'ꦌ' }, { latin: 'O', aksara: 'ꦎ' }
  ],
  pada: [
    { latin: 'pada lingsa (,)', aksara: '꧈' },
    { latin: 'pada lungsi (.)', aksara: '꧉' },
    { latin: 'pada adeg-adeg', aksara: '꧋' }
  ]
};

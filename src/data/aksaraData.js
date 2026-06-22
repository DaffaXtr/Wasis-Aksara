/**
 * aksaraData: Konstanta pemetaan karakter aksara latin ke Aksara Jawa (Unicode).
 */
export const aksaraData = {
  legena: [
    { latin: 'ha', aksara: 'ꦲ' },
    { latin: 'na', aksara: 'ꦤ' },
    { latin: 'ca', aksara: 'ꦕ' },
    { latin: 'ra', aksara: 'ꦪ' }, // Sesuai spesifikasi PDF Section 5.B
    { latin: 'ka', aksara: 'ꦦ' }, // Sesuai spesifikasi PDF Section 5.B
    { latin: 'da', aksara: 'backed_da_placeholder_or_unicode_check' }, // Placeholder / Tambahan
    { latin: 'ta', aksara: 'ta' }
  ],
  sandhangan: [
    { latin: 'wulu (i)', aksara: 'ꦶ' },
    { latin: 'suku (u)', aksara: 'ꦸ' },
    { latin: 'taling (é)', aksara: 'ꦺ' },
    { latin: 'pepet (e)', aksara: 'ꦼ' },
    { latin: 'taling tarung (o)', aksara: 'ꦺꦴ' }
  ],
  pasangan: [
    { latin: 'pasangan ha', aksara: 'ꦃ' },
    { latin: 'pasangan na', aksara: 'ꦚ' }
  ],
  murda: [
    { latin: 'Na', aksara: 'ꦯ' },
    { latin: 'Ka', aksara: 'ꦎ' },
    { latin: 'Ta', aksara: 'ꦘ' }
  ],
  rekan: [
    { latin: 'fa/va', aksara: 'ꦥꦲ꦳' },
    { latin: 'za', aksara: 'ꦨ꦳' }
  ],
  swara: [
    { latin: 'A', aksara: 'ꦱ' },
    { latin: 'I', aksara: 'ꦵ' },
    { latin: 'U', aksara: 'ꦶ' }
  ]
};

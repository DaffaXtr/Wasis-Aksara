const MUTE_STORAGE_KEY = 'wasis_aksara_muted';

/**
 * AudioManager: Mengatur pemutaran musik latar (BGM) dan efek suara (SFX).
 * Status bisu disimpan terpisah dari save progres agar tidak ikut terhapus saat progres diriset.
 */
class AudioManager {
  constructor() {
    this.soundManager = null;
    this.bgmVolume = 0.15;
    this.sfxVolume = 0.8;
    this.isMuted = this.loadMuted();
    this.currentBgm = null;
    this.audioUnlockBound = false;
  }

  loadMuted() {
    try {
      return localStorage.getItem(MUTE_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  /**
   * Menginisialisasi AudioManager dengan Sound Manager milik Phaser.
   * @param {Phaser.Sound.BaseSoundManager} phaserSoundManager
   */
  init(phaserSoundManager) {
    this.soundManager = phaserSoundManager;
    this.soundManager.mute = this.isMuted;
  }

  /**
   * Memutar musik latar dari scene mana pun (menu, peta). Musik (±3 MB) dimuat saat pertama
   * dibutuhkan agar layar pertama tidak ikut menunggu.
   * @param {Phaser.Scene} scene
   */
  startBacksound(scene) {
    this.init(scene.sound);
    this.bindAudioUnlock(scene.sound);
    const play = () => this.playBGM('backsound', true);
    if (scene.cache.audio.exists('backsound')) {
      play();
      return;
    }
    scene.load.audio('backsound', 'assets/audio/backsound.mp3');
    scene.load.once('complete', play);
    scene.load.start();
  }

  /**
   * Melanjutkan AudioContext pada sentuhan/klik pertama (kebijakan autoplay browser).
   */
  bindAudioUnlock(soundManager) {
    if (this.audioUnlockBound) return;
    this.audioUnlockBound = true;
    const resumeAudio = () => {
      if (soundManager.context?.state === 'suspended') soundManager.context.resume();
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };
    document.addEventListener('click', resumeAudio);
    document.addEventListener('touchstart', resumeAudio);
  }

  /**
   * Memutar BGM tertentu. Tetap diputar saat bisu (Sound Manager yang dibisukan),
   * supaya musik langsung terdengar begitu suara dinyalakan lagi.
   * @param {string} key - Aset BGM yang dimuat di Phaser
   * @param {boolean} loop - Mengulang pemutaran (default: true)
   */
  playBGM(key, loop = true) {
    if (!this.soundManager) return;

    if (this.currentBgm && this.currentBgm.key === key && this.currentBgm.isPlaying) {
      // BGM yang sama sedang diputar, tidak perlu memulai ulang
      return;
    }

    this.stopBGM();

    try {
      this.currentBgm = this.soundManager.add(key, {
        volume: this.bgmVolume,
        loop: loop
      });
      this.currentBgm.play();
    } catch (e) {
      console.warn(`AudioManager: Gagal memutar BGM '${key}'. Aset mungkin belum dimuat.`, e);
    }
  }

  /**
   * Menghentikan BGM yang sedang diputar.
   */
  stopBGM() {
    if (this.currentBgm) {
      this.currentBgm.stop();
      this.currentBgm.destroy();
      this.currentBgm = null;
    }
  }

  /**
   * Membisukan atau membunyikan seluruh audio (BGM, dan SFX lewat utils/sfx.js).
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.soundManager) {
      this.soundManager.mute = this.isMuted;
    }
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, this.isMuted ? '1' : '0');
    } catch { /* Preferensi suara bersifat opsional. */ }
    return this.isMuted;
  }
}

// Export single instance (Core Singleton pattern)
export default new AudioManager();

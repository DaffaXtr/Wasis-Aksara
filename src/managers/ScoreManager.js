/**
 * ScoreManager: Menghitung skor berdasarkan kombo jawaban, waktu, serta konversi rating bintang.
 */
class ScoreManager {
  constructor() {
    this.currentScore = 0;
    this.comboCount = 0;
    this.baseScorePerAction = 100;
  }

  /**
   * Mengatur ulang skor dan kombo untuk level baru.
   */
  resetLevelScore() {
    this.currentScore = 0;
    this.comboCount = 0;
    console.log('ScoreManager: Skor level diriset.');
  }

  /**
   * Menambahkan skor berdasarkan jawaban yang benar.
   * Skor meningkat jika ada kombo (streak jawaban benar berturut-turut).
   */
  addCorrectAnswer() {
    this.comboCount += 1;
    // Multiplier combo: 1x, 1.2x, 1.5x, dst. (maks 3x)
    const multiplier = Math.min(3, 1 + (this.comboCount - 1) * 0.2);
    const addedScore = Math.round(this.baseScorePerAction * multiplier);
    
    this.currentScore += addedScore;
    console.log(`ScoreManager: Jawaban Benar! Kombo: x${this.comboCount}, Skor Ditambah: ${addedScore}, Total Skor: ${this.currentScore}`);
    
    return {
      addedScore,
      currentScore: this.currentScore,
      comboCount: this.comboCount
    };
  }

  /**
   * Meriset kombo saat pemain melakukan kesalahan.
   */
  addWrongAnswer() {
    this.comboCount = 0;
    console.log('ScoreManager: Jawaban Salah! Kombo diriset ke 0.');
  }

  /**
   * Menghitung jumlah bintang emas (1 - 3) berdasarkan perolehan skor dibanding target skor level.
   * @param {number} score - Skor yang didapatkan pemain
   * @param {number} targetScore - Target skor minimum untuk level tersebut
   */
  calculateStars(score, targetScore) {
    if (score >= targetScore) {
      return 3;
    } else if (score >= targetScore * 0.7) {
      return 2;
    } else if (score >= targetScore * 0.4) {
      return 1;
    }
    return 0;
  }
}

// Export single instance (Core Singleton pattern)
export default new ScoreManager();

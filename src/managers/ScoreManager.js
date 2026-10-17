/**
 * ScoreManager: Menyimpan skor level yang sedang dimainkan dan konversi rating bintang.
 */
class ScoreManager {
  constructor() {
    this.currentScore = 0;
  }

  /**
   * Mengatur ulang skor untuk level baru.
   */
  resetLevelScore() {
    this.currentScore = 0;
  }

  addBonus(points = 0) {
    this.currentScore += points;
    return this.currentScore;
  }

  /**
   * Bintang (0 - 3) berdasarkan jumlah jawaban bener untuk level berformat kuis.
   * Semua bener = 3, minimal 80% = 2, minimal 40% = 1.
   */
  starsFromCorrect(correct, total) {
    const ratio = total ? correct / total : 0;
    if (ratio >= 1) return 3;
    if (ratio >= 0.8) return 2;
    if (ratio >= 0.4) return 1;
    return 0;
  }
}

// Export single instance (Core Singleton pattern)
export default new ScoreManager();

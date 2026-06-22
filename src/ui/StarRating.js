import Phaser from 'phaser';

/**
 * Reusable StarRating Widget for Phaser.
 * Renders a row of 3 gold/gray stars depending on the score rating.
 */
export default class StarRating extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene - Target Scene
   * @param {number} x - X Coordinate
   * @param {number} y - Y Coordinate
   * @param {number} activeStars - Number of active stars (0 to 3)
   * @param {number} starSize - Font size / scale of stars
   */
  constructor(scene, x, y, activeStars = 0, starSize = 40) {
    super(scene, x, y);

    const maxStars = 3;
    const spacing = starSize * 1.2;

    this.stars = [];

    // Calculate total starting X offset to center the row
    const startX = -((maxStars - 1) * spacing) / 2;

    for (let i = 0; i < maxStars; i++) {
      const isStarred = i < activeStars;
      const starChar = isStarred ? '★' : '☆';
      const starColor = isStarred ? '#f2d28a' : '#5a4a3b'; // lightGold vs stone.light

      const starText = scene.add.text(startX + i * spacing, 0, starChar, {
        fontFamily: 'Poppins',
        fontSize: `${starSize}px`,
        color: starColor
      }).setOrigin(0.5);

      // Micro-animation zoom for earned stars
      if (isStarred) {
        starText.setScale(0);
        scene.tweens.add({
          targets: starText,
          scale: 1,
          ease: 'Back.easeOut',
          duration: 400,
          delay: i * 150
        });
      }

      this.add(starText);
      this.stars.push(starText);
    }

    // Register Container to Scene
    scene.add.existing(this);
  }

  /**
   * Dynamically updates the number of active stars.
   * @param {number} count - Active stars count (0 to 3)
   */
  setStars(count) {
    const activeStars = Math.min(3, Math.max(0, count));
    this.stars.forEach((star, index) => {
      const isStarred = index < activeStars;
      star.setText(isStarred ? '★' : '☆');
      star.setColor(isStarred ? '#f2d28a' : '#5a4a3b');
    });
  }
}

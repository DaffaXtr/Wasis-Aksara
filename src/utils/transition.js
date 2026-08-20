/**
 * Transition Manager: Handles 100% full-viewport fade-in and fade-out transitions across all scenes and aspect ratios.
 * Uses #global-curtain DOM overlay to guarantee seamless fullscreen coverage without 16:9 canvas box artifacts.
 */

export function fadeTransitionOut(scene, duration = 500, callback = null) {
  const curtain = document.getElementById('global-curtain');
  if (curtain) {
    curtain.style.transitionDuration = `${duration}ms`;
    curtain.classList.remove('opacity-0');
    curtain.classList.add('opacity-100');
  }

  // Clear any partial canvas camera effects
  if (scene?.cameras?.main) {
    scene.cameras.main.resetFX();
  }

  if (callback) {
    setTimeout(() => {
      callback();
    }, duration);
  }
}

export function fadeTransitionIn(scene, duration = 500) {
  const curtain = document.getElementById('global-curtain');
  if (curtain) {
    curtain.style.transitionDuration = `${duration}ms`;
    requestAnimationFrame(() => {
      curtain.classList.remove('opacity-100');
      curtain.classList.add('opacity-0');
    });
  }

  // Clear any partial canvas camera effects
  if (scene?.cameras?.main) {
    scene.cameras.main.resetFX();
  }
}

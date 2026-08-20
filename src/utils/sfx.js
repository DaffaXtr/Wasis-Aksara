let context;

function tone(frequency, duration = 0.1, type = 'sine', volume = 0.15, delay = 0, endFrequency) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    context ||= new AudioContext();
    if (context.state === 'suspended') context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  } catch { /* Audio is optional. */ }
}

export const sfxWrite = () => tone(820, 0.04, 'triangle', 0.08);
export const sfxOpen = () => tone(340, 0.18, 'sine', 0.14, 0, 680);
export const sfxSuccess = () => { tone(660, 0.12, 'triangle', 0.16); tone(880, 0.16, 'triangle', 0.16, 0.09); };
export const sfxError = () => tone(190, 0.22, 'sawtooth', 0.12, 0, 100);
export const sfxReward = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.14, i * 0.1));

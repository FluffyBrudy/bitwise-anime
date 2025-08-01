export class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported");
      this.enabled = false;
    }
  }

  playSelect() {
    this.playTone(800, 0.1, "sine");
  }

  playBit() {
    this.playTone(400 + Math.random() * 200, 0.05, "square");
  }

  playComplete() {
    this.playTone(523, 0.3, "sine");
    setTimeout(() => this.playTone(659, 0.3, "sine"), 100);
    setTimeout(() => this.playTone(784, 0.3, "sine"), 200);
  }

  playReset() {
    this.playTone(200, 0.2, "sawtooth");
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine"
  ) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {}
  }
}

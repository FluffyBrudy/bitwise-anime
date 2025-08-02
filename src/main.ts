import { AdvancedBitwiseVisualizer } from "./bitwiseVisualizer";
import { ParticleSystem } from "./particleSystem";
import { SoundManager } from "./soundManager";

class App {
  private particles: ParticleSystem;

  constructor() {
    new AdvancedBitwiseVisualizer();
    this.particles = new ParticleSystem();
    new SoundManager();

    this.init();
  }

  private init() {
    this.particles.init();

    setInterval(() => {
      this.particles.createAmbientParticle();
    }, 2000);

    this.setupKeyboardShortcuts();
  }

  private setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            document.getElementById("play-btn")?.click();
            break;
          case "r":
            e.preventDefault();
            document.getElementById("reset-btn")?.click();
            break;
        }
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new App();
});

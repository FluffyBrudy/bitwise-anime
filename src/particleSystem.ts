interface Particle {
  element: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private container: HTMLElement | null = null;

  init() {
    this.container = document.body;
    this.startUpdateLoop();
  }

  createBurst(x: number, y: number, count = 8) {
    for (let i = 0; i < count; i++) {
      this.createParticle(x, y, {
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        color: this.getRandomColor(),
        size: Math.random() * 4 + 2,
      });
    }
  }

  createBitParticle(x: number, y: number) {
    this.createParticle(x, y, {
      vx: (Math.random() - 0.5) * 100,
      vy: -Math.random() * 100 - 50,
      color: "#00d4ff",
      size: 3,
    });
  }

  createAmbientParticle() {
    if (!this.container) return;

    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight + 10;

    this.createParticle(x, y, {
      vx: (Math.random() - 0.5) * 50,
      vy: -Math.random() * 100 - 50,
      color: "rgba(92, 77, 255, 0.6)",
      size: Math.random() * 3 + 1,
    });
  }

  createCelebration(x: number, y: number, count = 15) {
    const colors = ["#00d4ff", "#5c4dff", "#ff6b6b", "#ffa500", "#00ff88"];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const velocity = 150 + Math.random() * 100;

      this.createParticle(x, y, {
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
      });
    }

    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        this.createParticle(
          x + (Math.random() - 0.5) * 200,
          y + (Math.random() - 0.5) * 100,
          {
            vx: (Math.random() - 0.5) * 50,
            vy: -Math.random() * 50 - 25,
            color: "#ffffff",
            size: Math.random() * 3 + 1,
          }
        );
      }
    }, 500);
  }

  private createParticle(x: number, y: number, options: any) {
    if (!this.container) return;

    const element = document.createElement("div");
    element.className = "particle";
    element.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${options.size}px;
      height: ${options.size}px;
      background: ${options.color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
    `;

    this.container.appendChild(element);

    const particle: Particle = {
      element,
      x,
      y,
      vx: options.vx,
      vy: options.vy,
      life: 0,
      maxLife: 2000 + Math.random() * 1000,
      color: options.color,
      size: options.size,
    };

    this.particles.push(particle);
  }

  private startUpdateLoop() {
    const update = () => {
      this.updateParticles();
      requestAnimationFrame(update);
    };
    update();
  }

  private updateParticles() {
    const deltaTime = 16;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.x += (particle.vx * deltaTime) / 1000;
      particle.y += (particle.vy * deltaTime) / 1000;

      particle.vy += (200 * deltaTime) / 1000;

      particle.life += deltaTime;

      particle.element.style.left = particle.x + "px";
      particle.element.style.top = particle.y + "px";

      const alpha = 1 - particle.life / particle.maxLife;
      particle.element.style.opacity = alpha.toString();

      if (
        particle.life >= particle.maxLife ||
        particle.y > window.innerHeight + 100
      ) {
        particle.element.remove();
        this.particles.splice(i, 1);
      }
    }
  }

  private getRandomColor(): string {
    const colors = ["#00d4ff", "#5c4dff", "#ff6b6b", "#ffa500", "#00ff88"];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

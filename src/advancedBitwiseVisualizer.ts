import gsap from "gsap";
import { BitwiseOperations } from "./bitwiseOperations";
import { ParticleSystem } from "./particleSystem";
import { SoundManager } from "./soundManager";
import type { TBitwiseOperators } from "./types";

export class AdvancedBitwiseVisualizer {
  private operations: BitwiseOperations;
  private particles: ParticleSystem;
  private sounds: SoundManager;
  private currentOperation: TBitwiseOperators | null = null;
  private animationSpeed = 1;
  private bitWidth = 32;
  private isAnimating = false;

  constructor() {
    this.operations = new BitwiseOperations();
    this.particles = new ParticleSystem();
    this.sounds = new SoundManager();
    this.init();
  }

  private init() {
    this.setupEventListeners();
    this.updateFormatDisplays();
  }

  private setupEventListeners() {
    const input1 = document.getElementById("input1") as HTMLInputElement;
    const input2 = document.getElementById("input2") as HTMLInputElement;

    input1?.addEventListener("input", () => this.updateFormatDisplays());
    input2?.addEventListener("input", () => this.updateFormatDisplays());

    const operatorButtons = document.querySelectorAll(".operator-button");
    operatorButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const target = e.target as HTMLButtonElement;
        const operator = target.dataset.op as TBitwiseOperators;
        this.selectOperator(operator);
      });
    });

    document
      .getElementById("play-btn")
      ?.addEventListener("click", () => this.playAnimation());
    document
      .getElementById("step-btn")
      ?.addEventListener("click", () => this.stepAnimation());
    document
      .getElementById("reset-btn")
      ?.addEventListener("click", () => this.resetVisualization());

    const speedSlider = document.getElementById(
      "animation-speed"
    ) as HTMLInputElement;
    speedSlider?.addEventListener("input", (e) => {
      this.animationSpeed = Number.parseFloat(
        (e.target as HTMLInputElement).value
      );
    });

    const bitWidthSelect = document.getElementById(
      "bit-width"
    ) as HTMLSelectElement;
    bitWidthSelect?.addEventListener("change", (e) => {
      this.bitWidth = Number.parseInt((e.target as HTMLSelectElement).value);
      this.updateFormatDisplays();
    });
  }

  private updateFormatDisplays() {
    const input1 = document.getElementById("input1") as HTMLInputElement;
    const input2 = document.getElementById("input2") as HTMLInputElement;

    const val1 = Number.parseInt(input1?.value || "0");
    const val2 = Number.parseInt(input2?.value || "0");

    const bin1 = document.getElementById("bin1");
    const bin2 = document.getElementById("bin2");
    const hex1 = document.getElementById("hex1");
    const hex2 = document.getElementById("hex2");

    if (bin1) bin1.textContent = isNaN(val1) ? "-" : this.formatBinary(val1);
    if (bin2) bin2.textContent = isNaN(val2) ? "-" : this.formatBinary(val2);
    if (hex1)
      hex1.textContent = isNaN(val1)
        ? "-"
        : "0x" + val1.toString(16).toUpperCase();
    if (hex2)
      hex2.textContent = isNaN(val2)
        ? "-"
        : "0x" + val2.toString(16).toUpperCase();
  }

  private formatBinary(num: number): string {
    const binary = (num >>> 0).toString(2);
    return binary.padStart(this.bitWidth, "0");
  }

  private selectOperator(operator: TBitwiseOperators) {
    document.querySelectorAll(".operator-button").forEach((btn) => {
      btn.classList.remove("selected");
    });

    const selectedButton = document.querySelector(`[data-op="${operator}"]`);
    selectedButton?.classList.add("selected");

    this.currentOperation = operator;

    const input2 = document.getElementById("input2") as HTMLInputElement;
    if (operator === "~") {
      input2.disabled = true;
      input2.style.opacity = "0.5";
    } else {
      input2.disabled = false;
      input2.style.opacity = "1";
    }

    this.updateOperationInfo(operator);

    this.sounds.playSelect();

    if (selectedButton) {
      const rect = selectedButton.getBoundingClientRect();
      this.particles.createBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
    }
  }

  private updateOperationInfo(operator: TBitwiseOperators) {
    const descriptions = {
      "&": "Bitwise AND: Returns 1 only when both bits are 1",
      "|": "Bitwise OR: Returns 1 when at least one bit is 1",
      "^": "Bitwise XOR: Returns 1 when bits are different",
      "~": "Bitwise NOT: Flips all bits (unary operation)",
      "<<": "Left Shift: Shifts bits left, filling with zeros",
      ">>": "Right Shift: Shifts bits right, preserving sign",
      ">>>": "Unsigned Right Shift: Shifts bits right, filling with zeros",
    };

    const descElement = document.getElementById("operation-description");
    if (descElement) {
      descElement.textContent = descriptions[operator];
    }
  }

  private async playAnimation() {
    if (this.isAnimating || !this.currentOperation) return;

    const input1 = document.getElementById("input1") as HTMLInputElement;
    const input2 = document.getElementById("input2") as HTMLInputElement;

    const val1 = Number.parseInt(input1?.value || "0");
    const val2 = Number.parseInt(input2?.value || "0");

    if (isNaN(val1) || (this.currentOperation !== "~" && isNaN(val2))) {
      this.showError("Please enter valid numbers");
      return;
    }

    this.isAnimating = true;

    try {
      await this.visualizeOperation(val1, val2, this.currentOperation);
    } catch (error) {
      this.showError("Animation error occurred");
    } finally {
      this.isAnimating = false;
    }
  }

  private async visualizeOperation(
    val1: number,
    val2: number,
    operator: TBitwiseOperators
  ) {
    const container = document.getElementById("visualization");
    if (!container) return;
    container.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
    await gsap.to(container.children, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      stagger: 0.1,
      onComplete: () => {
        container.innerHTML = "";
      },
    });

    const bitsContainer = document.createElement("div");
    bitsContainer.className = "bits-container";

    setTimeout(() => {
      bitsContainer?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    const progressBar = document.createElement("div");
    progressBar.className = "progress-container";
    progressBar.innerHTML = `
      <div class="progress-label">Processing Operation...</div>
      <div class="progress-bar">
        <div class="progress-fill" id="progress-fill"></div>
      </div>
    `;

    const operationDisplay = document.createElement("div");
    operationDisplay.className = "operation-display";
    operationDisplay.innerHTML = `
      <div class="operation-title">${this.getOperationName(operator)}</div>
      <div class="operation-formula">${val1} ${operator} ${
      operator === "~" ? "" : val2
    } = ?</div>
      <div class="operation-description">${this.getOperationDescription(
        operator
      )}</div>
    `;

    container.appendChild(progressBar);
    container.appendChild(operationDisplay);
    container.appendChild(bitsContainer);

    gsap.fromTo(
      [progressBar, operationDisplay],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.2 }
    );

    const bin1 = this.formatBinary(val1);
    const bin2 = operator === "~" ? "" : this.formatBinary(val2);

    const row1Container = document.createElement("div");
    row1Container.className = "bit-row-container";
    row1Container.innerHTML = `
      <div class="bit-label">Input A: <span class="bit-value">${val1}</span></div>
    `;
    const row1 = this.createBitRow(bin1, "input-row");
    row1Container.appendChild(row1);
    bitsContainer.appendChild(row1Container);

    if (operator !== "~") {
      const row2Container = document.createElement("div");
      row2Container.className = "bit-row-container";
      row2Container.innerHTML = `
        <div class="bit-label">Input B: <span class="bit-value">${val2}</span></div>
      `;
      const row2 = this.createBitRow(bin2, "input-row");
      row2Container.appendChild(row2);
      bitsContainer.appendChild(row2Container);
    }

    const operatorVisual = document.createElement("div");
    operatorVisual.className = "operator-visual";
    operatorVisual.innerHTML = `
      <div class="operator-symbol">${operator}</div>
      <div class="operator-line"></div>
    `;
    bitsContainer.appendChild(operatorVisual);

    const result = this.operations.calculate(val1, val2, operator);
    const resultBin = this.formatBinary(result);

    const resultContainer = document.createElement("div");
    resultContainer.className = "bit-row-container result-container";
    resultContainer.innerHTML = `
      <div class="bit-label result-label">Result: <span class="bit-value" id="result-value">?</span></div>
    `;
    const resultRow = this.createBitRow(resultBin, "result-row", true);
    resultContainer.appendChild(resultRow);
    bitsContainer.appendChild(resultContainer);

    gsap.fromTo(
      bitsContainer,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
    );

    await gsap.to({}, { duration: 0.5 });

    await this.animateBitwiseOperation(
      row1Container.querySelector(".bit-row") as HTMLElement,
      operator === "~"
        ? null
        : (bitsContainer.querySelector(
            ".bit-row-container:nth-child(2) .bit-row"
          ) as HTMLElement),
      resultRow,
      operator,
      (progress: number) => {
        const progressFill = document.getElementById("progress-fill");
        if (progressFill) {
          gsap.to(progressFill, { width: `${progress * 100}%`, duration: 0.2 });
        }
      }
    );

    gsap.to(progressBar, { opacity: 0, height: 0, duration: 0.5 });

    const resultValueElement = document.getElementById("result-value");
    if (resultValueElement) {
      gsap.to(resultValueElement, {
        scale: 1.2,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          resultValueElement.textContent = result.toString();
        },
      });
    }

    const resultPanel = document.createElement("div");
    resultPanel.className = "result-panel";
    resultPanel.innerHTML = `
      <div class="result-header">
        <h3>operation complete</h3>
      </div>
      <div class="result-grid">
        <div class="result-item">
          <div class="result-format">Decimal</div>
          <div class="result-value-large">${result}</div>
        </div>
        <div class="result-item">
          <div class="result-format">Binary</div>
          <div class="result-value-large">${resultBin}</div>
        </div>
        <div class="result-item">
          <div class="result-format">Hexadecimal</div>
          <div class="result-value-large">0x${result
            .toString(16)
            .toUpperCase()}</div>
        </div>
        <div class="result-item">
          <div class="result-format">Octal</div>
          <div class="result-value-large">0o${result.toString(8)}</div>
        </div>
      </div>
    `;

    container.appendChild(resultPanel);

    gsap.fromTo(
      resultPanel.children,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }
    );

    setTimeout(() => {
      resultPanel.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 500);

    this.sounds.playComplete();

    const rect = resultPanel.getBoundingClientRect();
    this.particles.createCelebration(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
  }

  private createBitRow(
    binary: string,
    className: string,
    isResult = false
  ): HTMLElement {
    const row = document.createElement("div");
    row.className = `bit-row ${className}`;

    for (let i = 0; i < binary.length; i++) {
      const bit = document.createElement("div");
      bit.className = `bit ${binary[i] === "1" ? "one" : "zero"}`;
      if (isResult) bit.classList.add("result");
      bit.textContent = isResult ? " " : binary[i];
      bit.dataset.index = i.toString();
      bit.dataset.value = binary[i];
      row.appendChild(bit);
    }

    return row;
  }

  private async animateBitwiseOperation(
    row1: HTMLElement,
    row2: HTMLElement | null,
    resultRow: HTMLElement,
    operator: TBitwiseOperators,
    onProgress?: (progress: number) => void
  ) {
    const bits1 = Array.from<HTMLInputElement>(row1.querySelectorAll(".bit"));
    const bits2 = row2
      ? Array.from<HTMLInputElement>(row2.querySelectorAll(".bit"))
      : [];
    const resultBits = Array.from(resultRow.querySelectorAll(".bit"));

    const animationDuration = 0.4 / this.animationSpeed;
    const delayBetweenBits = 0.15 / this.animationSpeed;
    const totalBits = bits1.length;

    let precomputedResultBits: string[] | null = null;
    if (["<<", ">>", ">>>"].includes(operator)) {
      const val1 = parseInt(bits1.map((bit) => bit.dataset.value).join(""), 2);
      const val2 =
        bits2.length > 0
          ? parseInt(bits2.map((bit) => bit.dataset.value).join(""), 2)
          : 0;
      const result = this.operations.calculate(val1, val2, operator);
      precomputedResultBits = this.formatBinary(result).split("");
    }

    bits1.forEach((bit, index) => {
      const indicator = document.createElement("div");
      indicator.className = "bit-position";
      indicator.textContent = (totalBits - 1 - index).toString();
      bit.appendChild(indicator);
    });

    for (let i = bits1.length - 1; i >= 0; i--) {
      const bit1 = bits1[i];
      const bit2 = bits2[i];
      const resultBit = resultBits[i];
      const progress = (totalBits - i) / totalBits;

      onProgress?.(progress);

      gsap.to(bit1, {
        scale: 1.4,
        boxShadow: "0 0 20px rgba(0, 212, 255, 0.8)",
        duration: animationDuration,
        ease: "back.out(1.7)",
      });
      bit1.classList.add("active");

      if (bit2) {
        gsap.to(bit2, {
          scale: 1.4,
          boxShadow: "0 0 20px rgba(0, 212, 255, 0.8)",
          duration: animationDuration,
          ease: "back.out(1.7)",
        });
        bit2.classList.add("active");
      }

      let resultValue: number;
      let tooltipText: string;

      if (["<<", ">>", ">>>"].includes(operator) && precomputedResultBits) {
        resultValue = Number(precomputedResultBits[i]);
        tooltipText = `Result bit: ${resultValue}`;
      } else {
        const val1 = Number.parseInt(
          (bit1 as HTMLInputElement).dataset.value || "0"
        );
        const val2 = bit2
          ? Number.parseInt((bit2 as HTMLInputElement).dataset.value || "0")
          : 0;
        resultValue = this.operations.calculate(val1, val2, operator);
        tooltipText =
          operator === "~"
            ? `~${val1} = ${resultValue}`
            : `${val1} ${operator} ${val2} = ${resultValue}`;
      }

      const tooltip = document.createElement("div");
      tooltip.className = "bit-tooltip";
      tooltip.textContent = tooltipText;
      document.body.appendChild(tooltip);

      const rect = resultBit.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2}px`;
      tooltip.style.top = `${rect.top - 40}px`;

      gsap.fromTo(
        tooltip,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3 }
      );

      resultBit.textContent = resultValue.toString();
      resultBit.classList.add(resultValue === 1 ? "one" : "zero");

      gsap.fromTo(
        resultBit,
        { opacity: 0, scale: 0, rotation: -180 },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: animationDuration * 1.5,
          ease: "back.out(2)",
        }
      );

      this.sounds.playBit();

      const bitRect = resultBit.getBoundingClientRect();
      this.particles.createBitParticle(
        bitRect.left + bitRect.width / 2,
        bitRect.top + bitRect.height / 2
      );

      await gsap.to({}, { duration: delayBetweenBits });

      gsap.to([bit1, bit2].filter(Boolean), {
        scale: 1,
        boxShadow: "none",
        duration: animationDuration,
      });
      bit1.classList.remove("active");
      bit2?.classList.remove("active");

      gsap.to(tooltip, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => tooltip.remove(),
      });
    }

    gsap.to(resultBits, {
      scale: 1.1,
      duration: 0.5,
      yoyo: true,
      repeat: 1,
      stagger: 0.05,
    });
  }

  private getOperationName(operator: TBitwiseOperators): string {
    const names = {
      "&": "Bitwise AND",
      "|": "Bitwise OR",
      "^": "Bitwise XOR",
      "~": "Bitwise NOT",
      "<<": "Left Shift",
      ">>": "Right Shift",
      ">>>": "Unsigned Right Shift",
    };
    return names[operator];
  }

  private stepAnimation() {
    alert("Step animation not yet implemented");
  }

  private resetVisualization() {
    const container = document.getElementById("visualization");
    if (container) {
      container.innerHTML = `
        <div class="welcome-message">
          <h2>Choose an operation to begin</h2>
          <p>Select a bitwise operator and enter your numbers to see the magic happen!</p>
        </div>
      `;
    }

    const input1 = document.getElementById("input1") as HTMLInputElement;
    const input2 = document.getElementById("input2") as HTMLInputElement;
    if (input1) input1.value = "";
    if (input2) input2.value = "";

    document.querySelectorAll(".operator-button").forEach((btn) => {
      btn.classList.remove("selected");
    });

    this.currentOperation = null;
    this.isAnimating = false;
    this.updateFormatDisplays();

    this.sounds.playReset();
  }

  private showError(message: string) {
    const error = document.createElement("div");
    error.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #ff6b6b, #ff4757);
      color: white;
      padding: 1rem 2rem;
      border-radius: 10px;
      font-weight: bold;
      z-index: 1000;
      box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
    `;
    error.textContent = message;
    document.body.appendChild(error);

    gsap.fromTo(
      error,
      { opacity: 0, x: 100 },
      { opacity: 1, x: 0, duration: 0.5 }
    );

    setTimeout(() => {
      gsap.to(error, {
        opacity: 0,
        x: 100,
        duration: 0.5,
        onComplete: () => error.remove(),
      });
    }, 3000);
  }

  private getOperationDescription(operator: TBitwiseOperators): string {
    const descriptions = {
      "&": "Each bit is 1 only if both corresponding bits are 1",
      "|": "Each bit is 1 if at least one corresponding bit is 1",
      "^": "Each bit is 1 only if corresponding bits are different",
      "~": "Each bit is flipped (0 becomes 1, 1 becomes 0)",
      "<<": "All bits are shifted left by the specified positions",
      ">>": "All bits are shifted right, preserving the sign bit",
      ">>>": "All bits are shifted right, filling with zeros",
    };
    return descriptions[operator];
  }
}

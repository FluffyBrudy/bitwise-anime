import gsap from "gsap";
import { padBinStr, decimal } from "./utils/binaryUtils";
import type { TBitwiseOperators } from "./types";

export class TextAnimator {
  private container: HTMLElement;
  private inputItems: Record<"first" | "second", HTMLInputElement>;

  constructor() {
    this.container = document.querySelector(".container")!;
    const inpelems =
      document.querySelectorAll<HTMLInputElement>(".input-field")!;
    this.inputItems = {
      first: inpelems[0],
      second: inpelems[1],
    };
  }

  setAnimationAction(operator: TBitwiseOperators) {
    const v1 = this.inputItems.first.value.trim();
    const v2 = this.inputItems.second.value.trim();

    if (operator === "~") {
      this.inputItems.second.disabled = true;
      if (!v1) {
        this.animateText(0, true, "Enter first input for unary operator ~");
        return;
      }
      this.animateUnaryOp(v1);
    } else {
      this.inputItems.second.disabled = false;
      if (!v1 || !v2) {
        this.animateText(0, true, "Enter both inputs");
        return;
      }

      if (operator === "<<" || operator === ">>" || operator === ">>>") {
        this.animateShiftOp(v1, v2, operator);
      } else {
        this.animateBinaryOp(v1, v2, operator);
      }
    }
  }

  private async animateBinaryOp(
    v1: string,
    v2: string,
    operator: TBitwiseOperators
  ) {
    let bin1: string, bin2: string;
    try {
      [bin1, bin2] = padBinStr(v1, v2);
    } catch (err) {
      this.animateText(0, true, (err as Error).message);
      return;
    }
    this.container.innerHTML = "";

    const len = bin1.length;
    const group = document.createElement("div");
    group.className = "bits-group";
    group.innerHTML = `
      <div class="row bits" id="row-1">${[...bin1]
        .map((b, i) => `<span class="bit" data-i="${i}">${b}</span>`)
        .join("")}</div>
      <div class="row bits" id="row-2">${[...bin2]
        .map((b, i) => `<span class="bit" data-i="${i}">${b}</span>`)
        .join("")}</div>
      <div class="row bits" id="row-r">${" "
        .repeat(len)
        .split("")
        .map((_, i) => `<span class="bit result" data-i="${i}"> </span>`)
        .join("")}</div>
      <div class="decimal" id="dec-out">= 0</div>
    `;
    this.container.appendChild(group);

    const bits1 = group.querySelectorAll<HTMLSpanElement>("#row-1 .bit");
    const bits2 = group.querySelectorAll<HTMLSpanElement>("#row-2 .bit");
    const bitsR = group.querySelectorAll<HTMLSpanElement>("#row-r .bit");
    const decOut = group.querySelector<HTMLDivElement>("#dec-out")!;

    const resultArr = new Array(len).fill("0");

    for (let i = len - 1; i >= 0; i--) {
      const b1 = Number(bits1[i].textContent);
      const b2 = Number(bits2[i].textContent);

      gsap.to([bits1[i], bits2[i]], { scale: 1.4, duration: 0.2 });

      let rBit: number;
      switch (operator) {
        case "&":
          rBit = b1 & b2;
          break;
        case "|":
          rBit = b1 | b2;
          break;
        case "^":
          rBit = b1 ^ b2;
          break;
        default:
          rBit = 0;
      }

      resultArr[i] = String(rBit);
      bitsR[i].textContent = String(rBit);
      gsap.fromTo(
        bitsR[i],
        { opacity: 0 },
        { opacity: 1, duration: 0.3, delay: 0.1 }
      );

      const partialDec = decimal(resultArr.join(""));
      decOut.textContent = `= ${partialDec}`;

      await gsap.to({}, { duration: 0.35 });

      gsap.to([bits1[i], bits2[i]], { scale: 1.0, duration: 0.2 });
    }

    await gsap.fromTo(
      decOut,
      { scale: 1 },
      { scale: 1.3, yoyo: true, repeat: 1, duration: 0.3 }
    );
  }

  private async animateUnaryOp(v1: string) {
    this.container.innerHTML = "";
    const n1 = Number(v1);
    if (Number.isNaN(n1)) {
      this.animateText(0, true, "Invalid input for unary operator");
      return;
    }

    const bin1 = n1.toString(2);
    const len = bin1.length;

    const group = document.createElement("div");
    group.className = "bits-group";
    group.innerHTML = `
      <div class="row bits" id="row-1">${[...bin1]
        .map((b, i) => `<span class="bit" data-i="${i}">${b}</span>`)
        .join("")}</div>
      <div class="row bits" id="row-r">${" "
        .repeat(len)
        .split("")
        .map((_, i) => `<span class="bit result" data-i="${i}"> </span>`)
        .join("")}</div>
      <div class="decimal" id="dec-out">= 0</div>
    `;
    this.container.appendChild(group);

    const bits1 = group.querySelectorAll<HTMLSpanElement>("#row-1 .bit");
    const bitsR = group.querySelectorAll<HTMLSpanElement>("#row-r .bit");
    const decOut = group.querySelector<HTMLDivElement>("#dec-out")!;

    const resultArr = new Array(len).fill("0");

    for (let i = len - 1; i >= 0; i--) {
      const b1 = Number(bits1[i].textContent);
      gsap.to(bits1[i], { scale: 1.4, duration: 0.2 });

      const rBit = b1 ^ 1;
      resultArr[i] = String(rBit);

      bitsR[i].textContent = String(rBit);
      gsap.fromTo(
        bitsR[i],
        { opacity: 0 },
        { opacity: 1, duration: 0.3, delay: 0.1 }
      );

      const partialDec = decimal(resultArr.join(""));
      decOut.textContent = `= ${partialDec}`;

      await gsap.to({}, { duration: 0.35 });

      gsap.to(bits1[i], { scale: 1.0, duration: 0.2 });
    }

    await gsap.fromTo(
      decOut,
      { scale: 1 },
      { scale: 1.3, yoyo: true, repeat: 1, duration: 0.3 }
    );
  }

  private animateShiftOp(v1: string, v2: string, operator: TBitwiseOperators) {
    this.container.innerHTML = "";

    const n1 = Number(v1);
    const n2 = Number(v2);

    if (Number.isNaN(n1) || Number.isNaN(n2)) {
      this.animateText(0, true, "Invalid inputs for shift operation");
      return;
    }

    let shifted: number;
    switch (operator) {
      case "<<":
        shifted = n1 << n2;
        break;
      case ">>":
        shifted = n1 >> n2;
        break;
      case ">>>":
        shifted = n1 >>> n2;
        break;
      default:
        this.animateText(0, true, "Invalid shift operator");
        return;
    }

    const bin1 = n1.toString(2);
    const binShifted = shifted.toString(2);

    const group = document.createElement("div");
    group.className = "bits-group";
    group.innerHTML = `
      <div class="row bits" id="row-1">${[...bin1]
        .map((b, i) => `<span class="bit" data-i="${i}">${b}</span>`)
        .join("")}</div>
      <div class="row bits" id="row-r">${[...binShifted]
        .map((b, i) => `<span class="bit result" data-i="${i}">${b}</span>`)
        .join("")}</div>
      <div class="decimal" id="dec-out">= ${shifted}</div>
    `;

    this.container.appendChild(group);
  }

  public async animateText(
    delay = 0,
    deleteSelf = false,
    ...strings: string[]
  ): Promise<void> {
    const groupWrapper = document.createElement("div");
    groupWrapper.className = "animation-group";
    this.container.appendChild(groupWrapper);

    const combinedText = strings.join(" ") + " ";

    const span = document.createElement("span");
    span.textContent = combinedText;
    span.className = "text";
    groupWrapper.appendChild(span);

    await gsap.from(span, {
      duration: 1,
      opacity: 0,
      y: -20,
      delay: delay,
    });

    if (deleteSelf) groupWrapper.remove();
  }
}

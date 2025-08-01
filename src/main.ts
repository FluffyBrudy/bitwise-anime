import { TextAnimator } from "./textAnimator";
import type { TBitwiseOperators } from "./types";

function bindBitwiseMenu(
  action: (operator: TBitwiseOperators) => void,
  inputSecond: HTMLInputElement
) {
  const menu = document.getElementById("bitwise-menu");
  if (!menu) return;

  const buttons = menu.querySelectorAll<HTMLButtonElement>(".operator-button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");

      const op = button.textContent as TBitwiseOperators;

      if (op === "~") {
        inputSecond.disabled = true;
        inputSecond.value = "";
      } else {
        inputSecond.disabled = false;
      }

      action(op);
    });
  });
}

async function main() {
  const animator = new TextAnimator();
  const secondInput = document.querySelector<HTMLInputElement>(
    ".input-field:nth-child(2)"
  )!;

  bindBitwiseMenu(animator.setAnimationAction.bind(animator), secondInput);

  await animator.animateText(
    0,
    false,
    "Choose an operator",
    "and enter inputs"
  );
}

main();

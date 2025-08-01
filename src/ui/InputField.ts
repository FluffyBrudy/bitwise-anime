interface InputFieldOptions {
  label: string;
  type?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onInput?: (value: string) => void;
  validate?: (value: string) => string | null;
}

export class InputField {
  private static children: HTMLElement[] = [];
  private container: HTMLDivElement;
  private input: HTMLInputElement;
  private errorElement: HTMLSpanElement;

  constructor(options: InputFieldOptions) {
    this.container = document.createElement("div");
    this.container.className = "input-field";

    const label = document.createElement("label");
    label.textContent = options.label;
    label.className = "input-label";

    this.input = document.createElement("input");
    this.input.type = options.type ?? "text";
    this.input.name = options.name ?? "";
    this.input.placeholder = options.placeholder ?? "";
    this.input.required = options.required ?? false;
    this.input.value = options.value ?? "";
    this.input.className = "input-box";

    label.htmlFor = options.name ?? "";

    this.errorElement = document.createElement("span");
    this.errorElement.className = "input-error";

    this.input.addEventListener("input", () => {
      const value = this.input.value;

      if (options.validate) {
        const error = options.validate(value);
        this.errorElement.textContent = error ?? "";
        this.input.classList.toggle("input-error-active", !!error);
      }

      options.onInput?.(value);
    });

    this.container.appendChild(label);
    this.container.appendChild(this.input);
    this.container.appendChild(this.errorElement);
  }

  mount(parent: HTMLElement) {
    parent.appendChild(this.container);
    InputField.children.push(this.container);
  }

  getValue(): string {
    return this.input.value;
  }

  setValue(value: string): void {
    this.input.value = value;
  }

  focus(): void {
    this.input.focus();
  }
}

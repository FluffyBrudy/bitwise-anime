type RGBAColor = [number, number, number, number];
class DisplayScreen {
  private canvas: HTMLCanvasElement;
  private initSize: { width: number; height: number };
  public ctx: CanvasRenderingContext2D;

  constructor(
    size?: DisplayScreen.Size,
    color: RGBAColor = [100, 100, 100, 0.3]
  ) {
    this.canvas = DisplayScreen.createCanvas(size);
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.fillStyle = `rgba(${color.join(",")})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.centerCanvas();

    this.initSize = { width: this.width, height: this.height };
  }

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }

  set width(width: number) {
    this.canvas.width = width;
  }

  set height(height: number) {
    this.canvas.height = height;
  }

  get element(): HTMLCanvasElement {
    return this.canvas;
  }

  resize(): void {
    const originalWidth = this.width;
    const originalHeight = this.height;

    const scale = Math.min(
      this.initSize.width / originalWidth,
      this.initSize.height / originalHeight
    );
    const newWidth = Math.round(originalWidth * scale);
    const newHeight = Math.round(originalHeight * scale);

    this.canvas.width = newWidth;
    this.canvas.height = newHeight;

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, newWidth, newHeight);
    this.centerCanvas();
  }

  getCanvas() {
    return this.canvas;
  }

  centerCanvas() {
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "50%";
    this.canvas.style.left = "50%";
    this.canvas.style.transform = "translate(-50%,-50%)";
  }

  resetOrigin() {
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0%";
    this.canvas.style.left = "0%";
    this.canvas.style.transform = "translate(0%,0%)";
  }

  static createCanvas(size?: DisplayScreen.Size): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = size?.width ?? window.innerWidth;
    canvas.height = size?.height ?? window.innerHeight;
    return canvas;
  }
}

namespace DisplayScreen {
  export interface Size {
    width: number;
    height: number;
  }
}

export { DisplayScreen };

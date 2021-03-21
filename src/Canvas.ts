import { Area, Color } from './types';

export default class Canvas {
  private element: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public constructor(width: number, height: number) {
    this.element = document.createElement('canvas');
    this.ctx = this.element.getContext('2d');

    this.setSize(width, height);
  }

  public get height() {
    return this.element.height;
  }

  public get width() {
    return this.element.width;
  }

  public attach(target: Element): void {
    target.appendChild(this.element);
  }

  public blit(image: CanvasImageSource): void;
  public blit(image: CanvasImageSource, source: Area, dest: Area): void;
  public blit(image: CanvasImageSource, source?: Area, dest?: Area): void {
    const sx = source?.x ?? 0;
    const sy = source?.y ?? 0;
    const sw = source?.width ?? image.width as number;
    const sh = source?.height ?? image.height as number;

    const dx = dest?.x ?? 0;
    const dy = dest?.y ?? 0;
    const dw = dest?.width ?? image.width as number;
    const dh = dest?.height ?? image.height as number;

    this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  public clear(color: string = '#fff'): void {
    this.ctx.fillStyle = color;

    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  public getElement(): Readonly<HTMLCanvasElement> {
    return this.element;
  }

  public setColorToAlpha(color: Color, alpha: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];

      if (r === color.r && g === color.g && b === color.b) {
        imageData.data[i + 3] = alpha;
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  public setSize(width: number, height: number): void {
    this.element.width = width;
    this.element.height = height;

    this.ctx.imageSmoothingEnabled = false;
  }
}
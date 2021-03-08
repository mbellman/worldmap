import { Area } from './types';

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

  public blit(image: CanvasImageSource, source: Area, dest: Area): void {
    this.ctx.drawImage(image,
      source.x, source.y, source.width, source.height,
      dest.x, dest.y, dest.width, dest.height
    );
  }

  public clear(color: string = '#fff'): void {
    this.ctx.fillStyle = color;

    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  public getElement(): Readonly<HTMLCanvasElement> {
    return this.element;
  }

  public setSize(width: number, height: number): void {
    this.element.width = width;
    this.element.height = height;

    this.ctx.imageSmoothingEnabled = false;
  }
}
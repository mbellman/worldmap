import { Area } from './types';

export default class Canvas {
  private element: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public constructor(width: number, height: number) {
    this.element = document.createElement('canvas');
    this.ctx = this.element.getContext('2d');

    this.element.width = width;
    this.element.height = height;
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

  public clear(color: string = '#fff'): void {
    this.ctx.fillStyle = color;

    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  public blit(image: HTMLImageElement, source: Area, dest: Area): void {
    this.ctx.drawImage(image,
      source.x, source.y, source.width, source.height,
      dest.x, dest.y, dest.width, dest.height
    );
  }
}